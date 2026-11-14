---
title: "Sales Forecasting"
description: "Time-series forecasting pipeline using a SARIMA and XGBoost ensemble, with a Power BI dashboard for aftermarket sales analysis."
status: "practice"
techs: ["Python", "pandas", "scikit-learn", "statsmodels", "SARIMA", "XGBoost", "Power BI"]
github: "https://github.com/mukundangopalachary/Sales-Forecasting-Dashboard"
images:
  - "/content/image1.png"
  - "/content/image2.png"
  - "/content/image3.png"
  - "/content/image4.png"
featured: false
order: 4
---

## Overview

This project was completed during a data analyst internship at Brakes India Pvt. Ltd. (June–July 2025). The goal was to forecast aftermarket sales volumes to assist inventory and planning decisions.

**Note:** The evaluation metrics below are from a practice dataset used during development, not from the company's production data.

## Business problem

Aftermarket sales data has strong seasonal patterns driven by vehicle service cycles and market trends. Accurate short-term forecasts help plan inventory levels and reduce stock imbalances.

## Methodology

### Data
Practice dataset: approximately 9,000 rows and 24 columns of time-series sales records.

### Forecasting pipeline
Two models were trained and their predictions combined:

1. **SARIMA** — Captures linear trend and seasonal structure. Configuration: `(2,1,2)(1,1,1,12)` to model monthly seasonality.
2. **XGBoost** — Captures non-linear patterns and residual structure not modelled by SARIMA. Features derived from lag values, rolling statistics, and calendar features.

The final forecast is a weighted ensemble of the two model outputs.

### Evaluation (practice dataset)
| Metric | Value |
|--------|-------|
| MAPE   | 15.93% |
| MAE    | 53,968 |

These figures are from the practice dataset only and do not reflect production results.

## Dashboard

A Power BI dashboard was built to surface forecast vs. actual comparisons, trend decomposition, and performance metrics for internal review.

## Status
Practice project. Methodology and evaluation completed on practice data during internship.
