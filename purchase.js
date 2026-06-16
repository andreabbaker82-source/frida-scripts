/*
 * Frida script to directly send a purchase event to AppsFlyer SDK.
 * The script waits 4 seconds for the app to fully launch, then calls
 * AppsFlyerLib.logEvent() with revenue details.
 */

setTimeout(function () {
    Java.perform(function () {
        console.log("\n[+] Purchase Event Injector – sending af_purchase to AppsFlyer");

        try {
            // 1. Get the Application Context
            var ActivityThread = Java.use("android.app.ActivityThread");
            var context = ActivityThread.currentApplication().getApplicationContext();
            if (context == null) {
                console.log("[-] Failed to get ApplicationContext. Is the app running?");
                return;
            }

            // 2. Prepare the event values (purchase details)
            var HashMap = Java.use("java.util.HashMap");
            var eventValues = HashMap.$new();

            // Required revenue fields for AppsFlyer
            eventValues.put("af_revenue", "49.99");   // revenue as string
            eventValues.put("af_currency", "USD");   // ISO 4217 currency code
            eventValues.put("af_content_id", "Emeralds"); // optional product ID

            // Optional: you can add more keys like af_order_id, etc.
            // eventValues.put("af_order_id", "test_order_123");

            // 3. Event name – must be af_purchase for a purchase event
            var eventName = "af_purchase";

            // 4. Get the AppsFlyerLib instance and log the event
            var AppsFlyerLib = Java.use("com.appsflyer.AppsFlyerLib");
            var instance = AppsFlyerLib.getInstance();

            console.log("    Event name : " + eventName);
            console.log("    Event values : " + eventValues.toString());

            instance.logEvent(context, eventName, eventValues);

            console.log("[✓] Purchase event sent successfully!\n");
        } catch (e) {
            console.log("[-] Error: " + e.message);
            if (e.stack) {
                console.log(e.stack);
            }
        }
    });
}, 4000); // 4-second delay to ensure the app and SDK are fully initialised

console.log("[*] Purchase Event Injector loaded – waiting for app startup...");
