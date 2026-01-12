# Custom POS Receipt Design & Last Receipt - Odoo 18.0

![Odoo Version](https://img.shields.io/badge/Odoo-18.0-blue)
![License](https://img.shields.io/badge/License-OPL--1-yellow)
![Version](https://img.shields.io/badge/Version-18.0.1.0.0-green)

## Overview

Enhance your Point of Sale experience with custom receipt designs and convenient last receipt printing functionality for Odoo 18.0.

## Key Features

### 🧾 Multiple Receipt Designs

Choose from pre-designed receipt templates to match your brand identity and business needs.

### 🎨 Custom Receipt Layouts

Personalize receipt appearance and branding with easy-to-edit templates and designs.

### 🖨️ Print Last Receipt

One-click button to reprint the most recent receipt - perfect for customer requests.

### 🔍 Smart Order Detection

Automatically identifies the last paid order for accurate receipt reprinting.

### ✅ Error Handling

Clear notifications for success and error states ensure smooth operation.

### ⚙️ Easy Configuration

Simple setup through POS configuration - no technical knowledge required.

### 🔄 Seamless Integration

Works perfectly with existing POS workflow without disrupting operations.

## Perfect For

- **Retail Stores** needing branded receipts
- **Restaurants** with custom receipt requirements
- **E-commerce Businesses** requiring receipt reprints
- **Any POS Setup** wanting enhanced receipt functionality

## Installation

1. Download and install the module from Odoo Apps
2. Navigate to **Point of Sale > Configuration > Point of Sale**
3. Configure receipt design in POS settings
4. Start using custom receipts and last receipt printing functionality

## Configuration

### Setting Up Receipt Designs

1. Go to **Point of Sale > Configuration > Receipt Designs**
2. Create or select a receipt design template
3. Customize the layout, colors, and branding
4. Assign the design to your POS configuration

### Enabling Last Receipt Print

1. Open your POS session
2. Look for the "Print Last Receipt" button in the POS interface
3. Click to instantly reprint the last transaction receipt

## Module Information

| Property        | Value                                    |
| --------------- | ---------------------------------------- |
| **Module Name** | custom_receipts_and_last_receipt_for_pos |
| **Version**     | 18.0.1.0.0                               |
| **Category**    | Point of Sale                            |
| **Author**      | Abdelghani X                             |
| **Website**     | https://www.AbdelghaniX.com              |
| **License**     | OPL-1                                    |
| **Price**       | $29.99 USD                               |
| **Depends**     | point_of_sale                            |

## Technical Details

### Module Structure

```
custom_receipts_and_last_receipt_for_pos/
├── __init__.py
├── __manifest__.py
├── data/
│   ├── pos_receipt_design1_data.xml
│   └── pos_receipt_design2_data.xml
├── models/
│   ├── __init__.py
│   ├── pos_config.py
│   ├── pos_receipt.py
│   └── pos_session.py
├── static/
│   ├── description/
│   │   └── index.html
│   └── src/
│       ├── js/
│       │   ├── print_last_receipt.js
│       │   └── receipt_design.js
│       └── xml/
│           ├── order_receipt.xml
│           └── print_last_receipt_button.xml
└── views/
    ├── pos_config_views.xml
    └── pos_receipt_views.xml
```

### Key Components

- **Models**: Custom models for POS configuration, receipt designs, and session management
- **JavaScript**: Frontend logic for receipt selection and last receipt printing
- **XML Templates**: Custom receipt layouts and POS interface modifications
- **Data Files**: Pre-configured receipt design templates

## Support

For support, feature requests, or bug reports:

- **Website**: [www.AbdelghaniX.com](https://www.AbdelghaniX.com)
- **Email**: contact@abdelghanix.com
- **Repository**: [GitHub](https://github.com/abdelghanix10/Custom-Receipt-Print-Last-Receipt-for-Odoo-Pos)

## Changelog

### Version 18.0.1.0.0 (2025-11-09)

- Initial release for Odoo 18.0
- Multiple receipt design templates
- Last receipt printing functionality
- Smart order detection
- Easy POS configuration integration
- Error handling and notifications

## License

This module is licensed under the Odoo Proprietary License v1.0 (OPL-1).

---

**© 2025 Abdelghani X. All rights reserved.**
