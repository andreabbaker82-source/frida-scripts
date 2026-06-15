Java.perform(function () {
    var ServerSocket = Java.use("java.net.ServerSocket");
    var Socket = Java.use("java.net.Socket");
    var PrintWriter = Java.use("java.io.PrintWriter");
    var BufferedReader = Java.use("java.io.BufferedReader");
    var InputStreamReader = Java.use("java.io.InputStreamReader");
    var Thread = Java.use("java.lang.Thread");

    var ActivityThread = Java.use("android.app.ActivityThread");
    var context = ActivityThread.currentApplication().getApplicationContext();

    var server = ServerSocket.$new(27043);
    console.log("[+] Engine listening on port 27043");

    var Runnable = Java.registerClass({
        name: 'com.engine.ServerLoop',
        implements: [Java.use('java.lang.Runnable')],
        methods: {
            run: function () {
                while (true) {
                    try {
                        var client = server.accept();
                        var input = BufferedReader.$new(InputStreamReader.$new(client.getInputStream()));
                        var output = PrintWriter.$new(client.getOutputStream(), true);
                        var line = input.readLine();
                        var response = "{}";

                        try {
                            var cmd = JSON.parse(line);
                            if (cmd.action === "send_purchase") {
                                var HashMap = Java.use("java.util.HashMap");
                                var vals = HashMap.$new();
                                vals.put("af_revenue", cmd.amount || "49.99");
                                vals.put("af_currency", cmd.currency || "USD");
                                vals.put("af_content_id", cmd.content_id || "coins");
                                var AppsFlyerLib = Java.use("com.appsflyer.AppsFlyerLib");
                                AppsFlyerLib.getInstance().logEvent(context, "af_purchase", vals);
                                response = JSON.stringify({ status: "success", message: "Purchase sent: " + (cmd.amount || "49.99") });
                            } else if (cmd.action === "ping") {
                                response = JSON.stringify({ status: "success", message: "Engine ready" });
                            }
                        } catch (e) {
                            response = JSON.stringify({ status: "error", message: e.message });
                        }

                        output.println(response);
                        client.close();
                    } catch (e) {
                        console.log("[-] " + e);
                    }
                }
            }
        }
    });

    var thread = Thread.$new(Runnable.$new());
    thread.start();
    console.log("[+] Purchase Engine started");
});
