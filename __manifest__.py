{
    'name': 'Custom POS Receipt Design & Last Receipt',
    'version': '18.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Add button to print last receipt in POS',
    'description': """
        POS Print Last Receipt
        ======================
        This module adds a button in the POS interface to print the last receipt.
        
        Features:
        ---------
        * Print Last Receipt button in the action pad
        * Automatically finds the last paid order
        * Uses Odoo's default receipt template
        * Shows notifications for success/errors
    """,
    'author': 'Abdelghani X',
    'website': 'https://www.AbdelghaniX.com',
    'license': 'OPL-1',
    'price': 29.99,
    'currency': 'USD',
    'images': ['static/description/banner.png'],
    'depends': ['point_of_sale'],
    'data': [
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
    'installable': True,
    'auto_install': False,
    'application': False
}