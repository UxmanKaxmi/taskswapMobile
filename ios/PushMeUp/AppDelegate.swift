import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase // ✅ Add this import
import RNBootSplash // ⬅️ add this import

// Splash background, matching BootSplash.storyboard's colorset (light #F4F4EF,
// dark #131318). Painted on the window and React root view so no white frame
// can flash between the launch screen, the native splash, and RN's first paint.
private let splashBackgroundColor = UIColor { trait in
  trait.userInterfaceStyle == .dark
    ? UIColor(red: 0x13 / 255.0, green: 0x13 / 255.0, blue: 0x18 / 255.0, alpha: 1)
    : UIColor(red: 0xF4 / 255.0, green: 0xF4 / 255.0, blue: 0xEF / 255.0, alpha: 1)
}


@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = splashBackgroundColor

    factory.startReactNative(
      withModuleName: "PushMeUp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // Deep links (pushmeup://…) tapped while the app is running or backgrounded.
  // Without this forward, iOS opens the app but JS never receives the URL.
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal links (https://pushmeup.app/…) once associated domains are live.
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

   override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    rootView.backgroundColor = splashBackgroundColor
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // ⬅️ initialize the splash screen
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
}
