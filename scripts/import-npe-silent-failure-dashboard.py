#!/usr/bin/env python3
"""Import NPE silent-failure Vega dashboard into Kibana (otel-demo)."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path

KIBANA_URL = os.environ["KIBANA_URL"].rstrip("/")
API_KEY = os.environ["ES_API_KEY"]

IDS = {
    "heatmap": "npe-silent-fail-heatmap",
    "bars": "npe-silent-fail-by-partner",
    "scatter": "npe-partner-anomaly-scatter",
    "dashboard": "npe-silent-failures-partner",
}


def kb(method: str, path: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        f"{KIBANA_URL}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"ApiKey {API_KEY}",
            "kbn-xsrf": "true",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"{method} {path} -> {e.code}: {err[:500]}") from e


HEATMAP = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": "Silent failures by partnerID over time",
    "data": {
        "url": {
            "%context%": True,
            "%timefield%": "@timestamp",
            "index": "npe-synthetic-transaction-details",
        },
        "format": {"property": "hits.hits"},
    },
    "transform": [
        {"calculate": "datum._source.partnerID", "as": "partnerID"},
        {"calculate": "datum._source.silent_failure", "as": "silent_failure"},
        {"calculate": "toDate(datum._source['@timestamp'])", "as": "time"},
        {"filter": "datum.silent_failure == true"},
    ],
    "mark": {"type": "rect", "tooltip": True},
    "encoding": {
        "x": {
            "field": "time",
            "type": "temporal",
            "timeUnit": "hours",
            "title": "Time",
        },
        "y": {
            "field": "partnerID",
            "type": "nominal",
            "sort": "-color",
            "title": "partnerID",
        },
        "color": {
            "aggregate": "count",
            "type": "quantitative",
            "title": "Silent failures",
            "scale": {"scheme": "blues"},
        },
        "tooltip": [
            {"field": "partnerID", "type": "nominal"},
            {
                "aggregate": "count",
                "type": "quantitative",
                "title": "Silent failures",
            },
        ],
    },
    "config": {"view": {"stroke": None}, "axis": {"labelFontSize": 11}},
}

BARS = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": "Silent failure count by partnerID",
    "data": {
        "url": {
            "%context%": True,
            "%timefield%": "@timestamp",
            "index": "npe-synthetic-transaction-details",
        },
        "format": {"property": "hits.hits"},
    },
    "transform": [
        {"calculate": "datum._source.partnerID", "as": "partnerID"},
        {"calculate": "datum._source.silent_failure", "as": "silent_failure"},
        {"filter": "datum.silent_failure == true"},
    ],
    "mark": {"type": "bar", "tooltip": True},
    "encoding": {
        "y": {
            "field": "partnerID",
            "type": "nominal",
            "sort": "-x",
            "title": "partnerID",
        },
        "x": {
            "aggregate": "count",
            "type": "quantitative",
            "title": "Silent failures",
        },
        "color": {"value": "#e20074"},
    },
}

SCATTER = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": "Partner record_score — anomalies (score ≥ 75)",
    "data": {
        "url": {
            "%context%": True,
            "%timefield%": "@timestamp",
            "index": "npe-synthetic-ml-anomalies",
        },
        "format": {"property": "hits.hits"},
    },
    "transform": [
        {"calculate": "datum._source.partnerID", "as": "partnerID"},
        {"calculate": "datum._source.record_score", "as": "record_score"},
        {"calculate": "datum._source.actual[0]", "as": "actual"},
        {"calculate": "datum._source.typical[0]", "as": "typical"},
        {"calculate": "toDate(datum._source['@timestamp'])", "as": "time"},
        {
            "calculate": "datum.record_score >= 75 ? 'anomaly' : 'normal'",
            "as": "band",
        },
    ],
    "mark": {"type": "circle", "opacity": 0.7, "size": 50, "tooltip": True},
    "encoding": {
        "x": {"field": "time", "type": "temporal", "title": "Time"},
        "y": {
            "field": "actual",
            "type": "quantitative",
            "title": "Record count",
        },
        "color": {
            "field": "band",
            "type": "nominal",
            "scale": {
                "domain": ["normal", "anomaly"],
                "range": ["#0071e3", "#e7664c"],
            },
            "title": "Band",
        },
        "tooltip": [
            {"field": "partnerID"},
            {"field": "actual", "type": "quantitative"},
            {"field": "typical", "type": "quantitative"},
            {"field": "record_score", "type": "quantitative"},
        ],
    },
}


def vega_vis(vid: str, title: str, spec: dict) -> dict:
    return {
        "type": "visualization",
        "id": vid,
        "attributes": {
            "title": title,
            "description": "NPE synthetic silent-failure / partnerID Vega-Lite",
            "visState": json.dumps(
                {
                    "title": title,
                    "type": "vega",
                    "aggs": [],
                    "params": {"spec": json.dumps(spec)},
                }
            ),
            "uiStateJSON": "{}",
            "version": 1,
            "kibanaSavedObjectMeta": {
                "searchSourceJSON": json.dumps(
                    {"query": {"query": "", "language": "kuery"}, "filter": []}
                )
            },
        },
        "references": [],
    }


def upsert(obj: dict) -> None:
    path = f"/api/saved_objects/{obj['type']}/{obj['id']}"
    body = {
        "attributes": obj["attributes"],
        "references": obj.get("references", []),
    }
    try:
        kb("DELETE", path)
    except Exception:
        pass
    out = kb("POST", path, body)
    print(f"{obj['type']} {obj['id']} -> {out.get('id', 'ok')}")


def main() -> None:
    objects = [
        vega_vis(
            IDS["heatmap"],
            "Silent failures heatmap (partnerID × time)",
            HEATMAP,
        ),
        vega_vis(IDS["bars"], "Silent failures by partnerID", BARS),
        vega_vis(IDS["scatter"], "Partner record_score anomalies", SCATTER),
        {
            "type": "dashboard",
            "id": IDS["dashboard"],
            "attributes": {
                "title": "NPE Silent Failures · partnerID",
                "description": (
                    "Synthetic silent failures: outer SUCCESS but NAP/non-core failed. "
                    "Indices: npe-synthetic-transaction-details, npe-synthetic-ml-anomalies."
                ),
                "panelsJSON": json.dumps(
                    [
                        {
                            "version": "8.0.0",
                            "type": "visualization",
                            "gridData": {
                                "x": 0,
                                "y": 0,
                                "w": 48,
                                "h": 18,
                                "i": "h1",
                            },
                            "panelIndex": "h1",
                            "embeddableConfig": {"enhancements": {}},
                            "panelRefName": "panel_h1",
                        },
                        {
                            "version": "8.0.0",
                            "type": "visualization",
                            "gridData": {
                                "x": 0,
                                "y": 18,
                                "w": 24,
                                "h": 14,
                                "i": "b1",
                            },
                            "panelIndex": "b1",
                            "embeddableConfig": {"enhancements": {}},
                            "panelRefName": "panel_b1",
                        },
                        {
                            "version": "8.0.0",
                            "type": "visualization",
                            "gridData": {
                                "x": 24,
                                "y": 18,
                                "w": 24,
                                "h": 14,
                                "i": "s1",
                            },
                            "panelIndex": "s1",
                            "embeddableConfig": {"enhancements": {}},
                            "panelRefName": "panel_s1",
                        },
                    ]
                ),
                "optionsJSON": json.dumps(
                    {
                        "useMargins": True,
                        "syncColors": False,
                        "hidePanelTitles": False,
                    }
                ),
                "timeRestore": True,
                "timeFrom": "now-7d",
                "timeTo": "now",
                "version": 1,
                "kibanaSavedObjectMeta": {
                    "searchSourceJSON": json.dumps(
                        {
                            "query": {"query": "", "language": "kuery"},
                            "filter": [],
                        }
                    )
                },
            },
            "references": [
                {
                    "name": "panel_h1",
                    "type": "visualization",
                    "id": IDS["heatmap"],
                },
                {
                    "name": "panel_b1",
                    "type": "visualization",
                    "id": IDS["bars"],
                },
                {
                    "name": "panel_s1",
                    "type": "visualization",
                    "id": IDS["scatter"],
                },
            ],
        },
    ]

    for obj in objects:
        upsert(obj)

    url = (
        f"{KIBANA_URL}/app/dashboards#/view/{IDS['dashboard']}"
        f"?_g=(time:(from:now-7d,to:now))"
    )
    print("DASHBOARD_URL", url)
    Path("/tmp/npe_dashboard_url.txt").write_text(url + "\n")


if __name__ == "__main__":
    main()
