package io.driftlens.q;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    applyAlwaysSound();
  }

  @Override
  protected void onResume() {
    super.onResume();
    applyAlwaysSound();
  }

  /**
   * Allow media (the splash preloader video) to autoplay WITH sound — no tap
   * required. Android WebView blocks audible autoplay by default
   * (mediaPlaybackRequiresUserAction = true), which made the preloader play
   * silently on phones. Disabling it makes the sound play on every launch.
   */
  private void applyAlwaysSound() {
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserAction(false);
    }
  }
}
