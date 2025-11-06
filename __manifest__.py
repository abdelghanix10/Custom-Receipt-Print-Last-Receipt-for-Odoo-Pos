{
    'name': 'POS Receipt Design & Print Last Receipt With Custom Templates',
    'version': '18.0.1.0.4',
    'category': 'Point of Sale',
    'summary': "POS Receipt, Receipt Design, POS Receipt Template, Print Last Receipt, Design "
               "Report, Custom Receipt, POS Report, Customise Receipt, Odoo18, "
               "Odoo Apps, Print Last Receipt, POS Custom Receipt",
    'description': "Option to select the customised Receipts for each POS. So, "
                   "we can easily updated the Receipt Design for better styles",
                    "and also added the Print Last Receipt button in the POS interface to print ",
                     "the last receipt with custom templates.",
    'author': 'Abdelghani X',
    'company': 'Abdelghani X',
    'maintainer': 'Abdelghani X',
    'depends': ['base', 'point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'data/pos_receipt_design1_data.xml',
        'data/pos_receipt_design2_data.xml',
        'views/pos_receipt_views.xml',
        'views/pos_config_views.xml'
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'custom_receipts_for_pos/static/src/js/receipt_design.js',
            'custom_receipts_for_pos/static/src/js/print_last_receipt.js',
            'custom_receipts_for_pos/static/src/xml/order_receipt.xml',
            'custom_receipts_for_pos/static/src/xml/print_last_receipt_button.xml',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
    'application': False
}