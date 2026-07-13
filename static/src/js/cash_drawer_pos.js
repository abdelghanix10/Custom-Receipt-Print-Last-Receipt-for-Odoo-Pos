/** @odoo-module */

import { PosStore } from "@point_of_sale/app/services/pos_store";
import { patch } from "@web/core/utils/patch";

/**
 * Configurable ESC/POS cash drawer pulse commands.
 * Try each in order until one succeeds. Edit this list to match your printer.
 */
const CASH_DRAWER_COMMANDS = [
    "\x1B\x70\x00\x19\xFA",
    "\x1B\x70\x00\x32\x32",
    "\x1B\x70\x00\x19\x19",
];

/**
 * Send a raw ESC/POS command to open the cash drawer via QZ Tray.
 * Returns true on success, false on failure.
 */
async function openCashDrawer(qzService) {
    if (!qzService) {
        console.warn("[CashDrawer] QZ Tray service not available");
        return false;
    }
    try {
        await qzService.connect();
        const qzLib = qzService.getQZ();
        if (!qzLib) {
            console.warn("[CashDrawer] QZ Tray library not loaded");
            return false;
        }
        const printerName = await qzLib.printers.getDefault();
        console.log("[CashDrawer] Sending cash drawer command to:", printerName);
        for (const cmd of CASH_DRAWER_COMMANDS) {
            try {
                await qzService.print(printerName, cmd, "raw");
                console.log("[CashDrawer] Cash drawer opened successfully");
                return true;
            } catch (err) {
                console.warn("[CashDrawer] Command failed, trying next:", err.message);
            }
        }
        console.error("[CashDrawer] All commands failed");
    } catch (err) {
        console.error("[CashDrawer] Cash drawer open failed:", err.message);
    }
    return false;
}

patch(PosStore.prototype, {
    async printReceipt(options = {}) {
        // Check if the selected receipt design is set to "cash drawer only"
        const openCashDrawerOnly = this.config?.open_cash_drawer_only;
        console.log("[CashDrawer] open_cash_drawer_only =", openCashDrawerOnly);

        if (openCashDrawerOnly) {
            console.log("[CashDrawer] Skipping receipt print — opening cash drawer only");
            const qzService = this.env.services.qz_tray;
            await openCashDrawer(qzService);
            return { successful: true };
        }
        return super.printReceipt(...arguments);
    },
});
