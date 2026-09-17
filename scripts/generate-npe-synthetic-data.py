#!/usr/bin/env python3
"""Generate synthetic NPE docs from Downloads/mapping.json field shapes.

Creates NDJSON under data/npe-synthetic/ for local/bulk load.
Does NOT write to otel-demo / public demo by default.
"""

from __future__ import annotations

import json
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "npe-synthetic"
MAPPING = Path("/Users/psimkins/Downloads/mapping.json")

PARTNERS = [
    "116", "135", "117", "89", "138", "78", "100", "114", "132",
    "10032", "10033", "20408", "22508", "22510", "20428", "20047", "22250",
    "21808", "10018", "21208", "10007", "10008", "82", "79", "144",
]
CLUSTERS = ["polaris-a", "polaris-b", "titan-a"]
OPERATIONS = ["ADD_FEATURE", "REMOVE_FEATURE", "CHANGE_RATEPLAN", "PROVISION", "UPDATE_NAP"]
BRANDS = ["TMOBILE_POSTPAID", "TMOBILE_PREPAID", "METRO"]

# Scenario mix: healthy / hard_fail / silent_fail
SCENARIOS = (
    ["healthy"] * 70
    + ["hard_fail"] * 10
    + ["silent_fail"] * 20
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ts(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def npc_payload(*, silent: bool, partner_id: str, operation: str) -> str:
    """Compact NPC-style XML resembling Discover fullresponse payloads."""
    nap_as_score = "false" if silent else "true"
    dual = "OFF" if silent else "ON"
    nap_body = "" if silent and random.random() < 0.4 else f"<npc:NAP partnerId=\"{partner_id}\">ok</npc:NAP>"
    return (
        f"<npc:envelope><npc:catalog segment=\"TMOBILE_POSTPAID\">"
        f"<npc:operation>{operation}</npc:operation>"
        f"<npc:partnerID>{partner_id}</npc:partnerID>"
        f"<npc:dualProvisioningFlag>{dual}</npc:dualProvisioningFlag>"
        f"<npc:napAsScore>{nap_as_score}</npc:napAsScore>"
        f"<npc:voWifiEnabled>true</npc:voWifiEnabled>"
        f"<npc:mcaEnabled>true</npc:mcaEnabled>"
        f"<npc:ratePlanChange>{'true' if operation == 'CHANGE_RATEPLAN' else 'false'}</npc:ratePlanChange>"
        f"<npc:napMaskList><npc:elementToBeMasked>firstName</npc:elementToBeMasked>"
        f"<npc:elementToBeMasked>zipCode</npc:elementToBeMasked></npc:napMaskList>"
        f"{nap_body}"
        f"</npc:catalog></npc:envelope>"
    )


def make_proclog(i: int, when: datetime, scenario: str) -> dict:
    partner = random.choice(PARTNERS)
    op = random.choice(OPERATIONS)
    txn = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    silent = scenario == "silent_fail"
    hard = scenario == "hard_fail"

    if hard:
        status, responsecode, errorcode = "FAILED", "500", "NPE-HARD-500"
        errormessage = "Downstream timeout talking to NAP"
    else:
        # healthy + silent_fail both look successful on the wire
        status, responsecode, errorcode = "SUCCESS", "200", ""
        errormessage = ""

    duration_ms = random.randint(40, 2400)
    return {
        "@timestamp": ts(when),
        "ingest_timestamp": ts(when + timedelta(seconds=1)),
        "eventtimestamp": ts(when),
        "sourcetimestamp": ts(when - timedelta(milliseconds=50)),
        "kafkatimestamp": ts(when - timedelta(milliseconds=20)),
        "starttime": ts(when - timedelta(milliseconds=duration_ms)),
        "lsstarttime": ts(when - timedelta(milliseconds=duration_ms)),
        "lsendtime": ts(when),
        "@version": "1",
        "apitype": "NPC",
        "brand": random.choice(BRANDS),
        "billingtype": "POSTPAID",
        "clientid": partner,  # mapped stand-in for partner
        "consumerid": f"cons-{partner}",
        "clustername": random.choice(CLUSTERS),
        "contractcode": f"CC-{random.randint(100000, 999999)}",
        "duration": str(duration_ms),
        "errorcode": errorcode,
        "errormessage": errormessage,
        "extractorversion": "17.7.10.0",
        "hostname": f"npe-host-{random.randint(1, 12)}",
        "instance": f"npe-{random.randint(1, 6)}",
        "logtype": random.choice(["southbound", "northbound", "internal"]),
        "messageid": f"MSG-{uuid.uuid4().hex[:10].upper()}",
        "methodname": op,
        "msisdn": f"1425{random.randint(1000000, 9999999)}",
        "msisdntype": "MDN",
        "namespace": "npe-prod",
        "nodename": f"node-{random.randint(1, 8)}",
        "operation": op,
        "originalmessageid": f"ORIG-{uuid.uuid4().hex[:8].upper()}",
        "podname": f"npe-proc-{random.randint(1, 20)}",
        "proclogid": f"PL-{i:06d}",
        "protocol": "HTTPS",
        "responsecode": responsecode,
        "rootlogid": f"RL-{uuid.uuid4().hex[:8].upper()}",
        "routingid": partner,
        "scope": "PROD",
        "sdpid": f"SDP-{partner}",
        "segment": random.choice(BRANDS),
        "serviceid": "NPE-CORE",
        "severity": "ERROR" if hard else ("WARN" if silent else "INFO"),
        "source": "npe-synthetic",
        "sourcenamespace": "npe-prod",
        "sourcepod": f"adapter-{random.randint(1, 10)}",
        "status": status,
        "sublogid": f"SL-{i}",
        "target": "NAP" if "NAP" in op or silent else "CORE",
        "transactionid": txn,
        "user": "synthetic-loader",
        "version": "2.25.11.0",
        "fullrequest": npc_payload(silent=silent, partner_id=partner, operation=op),
        "fullrequestpayload": npc_payload(silent=silent, partner_id=partner, operation=op),
        "fullresponse": npc_payload(silent=silent, partner_id=partner, operation=op),
        # Demo helpers (not in mapping) — easy filters for silent-failure dashboards
        "synthetic_scenario": scenario,
        "silent_failure": silent,
        "partnerID": partner,
    }


def make_txn_details(i: int, when: datetime, scenario: str) -> dict:
    partner = random.choice(PARTNERS)
    op = random.choice(OPERATIONS)
    silent = scenario == "silent_fail"
    hard = scenario == "hard_fail"

    if hard:
        txn_status, status, nap, noncore = "FAILED", "FAILED", "FAILED", "true"
        status_desc = "Hard failure — NAP rejected"
        err = "NAP_REJECT"
    elif silent:
        # Outer transaction SUCCESS, NAP / non-core failed → silent failure
        txn_status, status, nap, noncore = "SUCCESS", "SUCCESS", "FAILED", "true"
        status_desc = "Silent failure — wire OK, NAP/non-core failed"
        err = ""
    else:
        txn_status, status, nap, noncore = "SUCCESS", "SUCCESS", "SUCCESS", "false"
        status_desc = "All subsystems OK"
        err = ""

    def sub_status(ok: bool) -> str:
        return "SUCCESS" if ok else "FAILED"

    core_ok = not hard
    return {
        "@timestamp": ts(when),
        "ingest_timestamp": ts(when + timedelta(seconds=2)),
        "eventtimestamp": ts(when),
        "createdtimestamp": ts(when - timedelta(seconds=5)),
        "updatedtimestamp": ts(when),
        "consumetimestamp": ts(when - timedelta(seconds=3)),
        "producedtimestamp": ts(when - timedelta(seconds=4)),
        "@version": "1",
        "action": op,
        "brand": random.choice(BRANDS),
        "bsstransactionid": f"BSS-{uuid.uuid4().hex[:10].upper()}",
        "clustername": random.choice(CLUSTERS),
        "consumerid": f"cons-{partner}",
        "contractcode": f"CC-{random.randint(100000, 999999)}",
        "corenestatus": sub_status(core_ok),
        "corenestatustimestamp": ts(when),
        "datasourcetype": "synthetic",
        "messageid": f"MSG-{uuid.uuid4().hex[:10].upper()}",
        "msisdn": f"1425{random.randint(1000000, 9999999)}",
        "napstatus": nap,
        "naptimestamp": ts(when),
        "nename": "NAP-NE-1",
        "noncorefailed": noncore,
        "noncorenestatus": sub_status(not silent and not hard),
        "operation": op,
        "originalmessageid": f"ORIG-{uuid.uuid4().hex[:8].upper()}",
        "pgwstatus": sub_status(random.random() > 0.05),
        "pgwtimestamp": ts(when),
        "processingtime": random.randint(50, 5000),
        "producer": "npe-synthetic",
        "routingid": int(partner) if partner.isdigit() else random.randint(100, 99999),
        "scope": "PROD",
        "status": status,
        "statusDesc": status_desc,
        "taskname": "synthetic_txn_details",
        "topic": "npe.transaction.details",
        "transactionerrorcode": err,
        "transactionstatus": txn_status,
        "unique_event_id": f"UEI-{uuid.uuid4().hex}",
        "campstatus": sub_status(True),
        "csstatus": sub_status(True),
        "emasstatus": sub_status(not silent),
        "epochstatus": sub_status(True),
        "iamstatus": sub_status(True),
        "ipmstatus": sub_status(True),
        "mobistatus": sub_status(True),
        "nnsrstatus": sub_status(True),
        "opmstatus": sub_status(True),
        "uwsgstatus": sub_status(True),
        "wsgstatus": sub_status(True),
        "vasprapidsosstatus": sub_status(True),
        "allnoncoreauthorized": "false" if silent else "true",
        "allnoncoreregistered": "false" if silent else "true",
        "atleastonenoncoresuccess": "true",
        "synthetic_scenario": scenario,
        "silent_failure": silent,
        "partnerID": partner,
        "clientid": partner,
    }


def make_ml_record(i: int, when: datetime) -> dict:
    """Synthetic ML anomaly-style docs for partner heatmaps (job-shaped)."""
    partner = random.choice(PARTNERS)
    score = random.choice(
        [random.uniform(0, 25)] * 6
        + [random.uniform(25, 60)] * 2
        + [random.uniform(75, 98)] * 2  # anomalies
    )
    actual = int(random.gauss(40, 20))
    if score >= 75:
        actual = int(random.uniform(300, 725))
    typical = max(5, int(actual * random.uniform(0.2, 0.5))) if score >= 75 else actual
    return {
        "@timestamp": ts(when),
        "job_id": "monitor_wholesale_rateplan_highcount_v2_synthetic",
        "result_type": "record",
        "record_score": round(score, 2),
        "initial_record_score": round(score, 2),
        "is_interim": False,
        "bucket_span": 3600,
        "function": "count",
        "function_description": "count",
        "detector_index": 0,
        "partition_field_name": "partnerID",
        "partition_field_value": partner,
        "by_field_name": "partnerID",
        "by_field_value": partner,
        "influencer_field_name": "partnerID",
        "influencer_field_value": partner,
        "influencers": [
            {"influencer_field_name": "partnerID", "influencer_field_values": [partner]}
        ],
        "actual": [float(actual)],
        "typical": [float(typical)],
        "partnerID": partner,
        "source": "npe-synthetic",
    }


def write_ndjson(path: Path, docs: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as f:
        for doc in docs:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")


def write_bulk(path: Path, index: str, docs: list[dict]) -> None:
    with path.open("w") as f:
        for doc in docs:
            f.write(json.dumps({"index": {"_index": index}}) + "\n")
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")


def main() -> None:
    random.seed(42)
    OUT.mkdir(parents=True, exist_ok=True)

    mapping_note = "mapping.json not found — generating from embedded field shapes"
    if MAPPING.exists():
        with MAPPING.open() as f:
            maps = json.load(f)
        mapping_note = f"grounded on {len(maps)} indices from {MAPPING}"

    n = 400
    start = utc_now() - timedelta(days=7)
    proclogs, details, ml_recs = [], [], []

    for i in range(n):
        when = start + timedelta(minutes=random.randint(0, 7 * 24 * 60))
        scenario = random.choice(SCENARIOS)
        proclogs.append(make_proclog(i, when, scenario))
        details.append(make_txn_details(i, when, scenario))
        # denser ML grid for heatmaps
        for _ in range(2):
            ml_when = start + timedelta(minutes=random.randint(0, 7 * 24 * 60))
            ml_recs.append(make_ml_record(i, ml_when))

    write_ndjson(OUT / "npe_proclog_synthetic.ndjson", proclogs)
    write_ndjson(OUT / "npe_transaction_details_synthetic.ndjson", details)
    write_ndjson(OUT / "ml_anomalies_partner_synthetic.ndjson", ml_recs)

    write_bulk(OUT / "bulk_npe_proclog.ndjson", "npe-synthetic-proclog", proclogs)
    write_bulk(OUT / "bulk_npe_transaction_details.ndjson", "npe-synthetic-transaction-details", details)
    write_bulk(OUT / "bulk_ml_anomalies_partner.ndjson", "npe-synthetic-ml-anomalies", ml_recs)

    silent_n = sum(1 for d in details if d.get("silent_failure"))
    hard_n = sum(1 for d in details if d.get("synthetic_scenario") == "hard_fail")
    summary = {
        "generated_at": ts(utc_now()),
        "note": mapping_note,
        "counts": {
            "proclog": len(proclogs),
            "transaction_details": len(details),
            "ml_anomaly_records": len(ml_recs),
            "silent_failures": silent_n,
            "hard_failures": hard_n,
            "healthy": len(details) - silent_n - hard_n,
        },
        "partners": PARTNERS,
        "indices": [
            "npe-synthetic-proclog",
            "npe-synthetic-transaction-details",
            "npe-synthetic-ml-anomalies",
        ],
        "silent_failure_definition": (
            "transactionstatus/status SUCCESS (or proclog status SUCCESS) but "
            "napstatus FAILED and/or noncorefailed=true; payload flags napAsScore=false "
            "or dualProvisioningFlag=OFF"
        ),
        "load_hint": (
            "Bulk load to YOUR NPE/serverless project (not otel-demo): "
            "curl -s -H \"Authorization: ApiKey $ES_API_KEY\" "
            "-H \"Content-Type: application/x-ndjson\" "
            "--data-binary @data/npe-synthetic/bulk_npe_transaction_details.ndjson "
            "\"$ES_URL/_bulk\""
        ),
    }
    (OUT / "SUMMARY.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
