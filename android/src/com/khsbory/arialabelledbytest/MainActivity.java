package com.khsbory.arialabelledbytest;

import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.Activity;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.accessibility.AccessibilityManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.util.List;

public class MainActivity extends Activity {
    static final String TEST_URL = "@@URL@@";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new InfoBridge(), "AndroidInfo");
        setContentView(webView);
        webView.loadUrl(TEST_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    private String versionOf(String pkg) {
        try {
            PackageInfo pi = getPackageManager().getPackageInfo(pkg, 0);
            return pi.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return null;
        }
    }

    class InfoBridge {
        @JavascriptInterface
        public String getInfo() {
            JSONObject o = new JSONObject();
            try {
                PackageInfo wv = WebView.getCurrentWebViewPackage();
                if (wv != null) {
                    o.put("webViewPackage", wv.packageName);
                    o.put("webViewVersion", wv.versionName);
                }
                o.put("model", Build.MANUFACTURER + " " + Build.MODEL);
                o.put("androidVersion", Build.VERSION.RELEASE);
                AccessibilityManager am = (AccessibilityManager) getSystemService(ACCESSIBILITY_SERVICE);
                StringBuilder sb = new StringBuilder();
                if (am != null) {
                    List<AccessibilityServiceInfo> list = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_SPOKEN);
                    for (AccessibilityServiceInfo info : list) {
                        String pkg = info.getResolveInfo().serviceInfo.packageName;
                        String name;
                        if (pkg.equals("com.samsung.android.accessibility.talkback")) name = "Samsung TalkBack";
                        else if (pkg.equals("com.google.android.marvin.talkback")) name = "Google TalkBack";
                        else name = String.valueOf(info.getResolveInfo().loadLabel(getPackageManager()));
                        String v = versionOf(pkg);
                        if (sb.length() > 0) sb.append(", ");
                        sb.append(name);
                        if (v != null) sb.append(" ").append(v);
                    }
                }
                o.put("screenReaders", sb.toString());
            } catch (Exception e) {
                // ignore
            }
            return o.toString();
        }
    }
}
