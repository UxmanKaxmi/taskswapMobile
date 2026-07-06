package com.pushmeup.app
import android.os.Bundle
import com.zoontek.rnbootsplash.RNBootSplash

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "PushMeUp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme) // ⬅️ initialize the splash screen
        // Pass null (not savedInstanceState) so Android does NOT restore stale native
        // fragment state onto a freshly-built React tree. Required by react-native-screens;
        // without it, relaunching the activity from a background/killed state — e.g.
        // tapping a push notification — crashes.
        super.onCreate(null)
    }
}
