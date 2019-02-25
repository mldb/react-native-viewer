// @flow

import React, { Component } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  ViewStyle,
  StatusBar,
  Easing,
  Image,
  Platform,
  Modal
} from "react-native";
import TimerMixin from "react-timer-mixin";
import TransformView from "./transform-view";
import BACKIMG from "./images/back.png";

const Screen = Dimensions.get("screen");
const ANIMATION_DURATION = 230;
const filler = {
  flex: 1
};
type Props = {
  style: ViewStyle,
  topBar: View,
  topBarStyle: ViewStyle,
  bottomBar: View,
  bottomBarStyle: ViewStyle,
  children: View,
  fullScreenSize: { width: number, height: number }
};
export default class Viewer extends Component<Props> {
  static defaultProps = {
    fullScreenSize: { width: Screen.width, height: Screen.height }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      opened: false,
      enableTransform: false
    };
    this.showOptions = true;
    this.translating = false;
    this.translateX = new Animated.Value(0);
    this.translateY = new Animated.Value(0);
    this.scaleLevel = new Animated.Value(1);
    this.opacity = new Animated.Value(150);
    this.sourceOpacity = new Animated.Value(1);
    this.optionsOpacity = new Animated.Value(1);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.onTransform = this.onTransform.bind(this);
    this.measurement = this.measurement.bind(this);
    this.onChildPress = this.onChildPress.bind(this);
    this.onTransformGestureReleased = this.onTransformGestureReleased.bind(
      this
    );
    this.setTimeout = TimerMixin.setTimeout;
  }

  close() {
    this.opened = false;
    this.translating = true;
    this.End = true;
    // StatusBar.setHidden(false)
    StatusBar.setBackgroundColor("#FAFAFA", true);
    StatusBar.setBarStyle("dark-content", true);
    this.setState({ enableTransform: false });
    Animated.delay(ANIMATION_DURATION - 30).start(() =>
      this.sourceOpacity.setValue(1)
    );
    Animated.parallel(
      [
        Animated.timing(this.translateY, {
          toValue: 0,
          easing: Easing.elastic(0.5),
          useNativeDriver: true,
          duration: ANIMATION_DURATION
        }),
        Animated.timing(this.translateX, {
          toValue: 0,
          easing: Easing.elastic(0.5),
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(this.scaleLevel, {
          toValue: 1,
          easing: Easing.inOut(Easing.back(0)),
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(this.opacity, {
          toValue: -200,
          easing: Easing.linear,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(this.optionsOpacity, {
          toValue: 0,
          easing: Easing.linear,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        })
      ],
      { stopTogether: false }
    ).start(() => {
      this.End = false;
      this.notFirst = false;
      this.translating = false;

      this.setState({ opened: false });
    });
  }

  open() {
    const {
      sourceImageX,
      sourceImageY,
      sourceImageHeight,
      sourceImageWidth
    } = this.state;
    if (!sourceImageX) {
      return;
    }
    this.translating = true;
    this.opened = true;
    Animated.delay(ANIMATION_DURATION * 2).start(
      (): any => this.sourceOpacity.setValue(0)
    );
    this.setState({ opened: true });
    StatusBar.setBarStyle("light-content", true);
    StatusBar.setBackgroundColor("#000", true);
    const {
      fullScreenSize: { height, width }
    } = this.props;
    const isLandscape = Screen.width / Screen.height <= width / height;
    let dist;
    let scaleVal;
    if (isLandscape) {
      dist = (Screen.width * height) / width;
      scaleVal = Screen.width / sourceImageWidth;
    } else {
      dist = (Screen.height * width) / height;
      scaleVal = dist / sourceImageWidth;
    }
    const sourceTransformY =
      Screen.height / 2 - (sourceImageY + sourceImageHeight / 2);
    const sourceTransformX =
      Screen.width / 2 - (sourceImageX + sourceImageWidth / 2);
    Animated.parallel([
      Animated.timing(this.translateY, {
        toValue: sourceTransformY / scaleVal,
        easing: Easing.linear,
        useNativeDriver: true,
        duration: ANIMATION_DURATION
      }),
      Animated.timing(this.translateX, {
        toValue: sourceTransformX / scaleVal,
        easing: Easing.linear,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      Animated.timing(this.scaleLevel, {
        toValue: scaleVal,
        easing: Easing.linear,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      Animated.timing(this.opacity, {
        toValue: 0,
        easing: Easing.linear,
        delay: ANIMATION_DURATION / 3,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      Animated.timing(this.optionsOpacity, {
        toValue: 1,
        easing: Easing.linear,
        delay: ANIMATION_DURATION / 3,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      })
    ]).start(
      (): any => {
        this.notFirst = true;
        this.translating = false;
        this.setState({ enableTransform: true });
      }
    );
  }

  onTransformGestureReleased(event: object) {
    if (this.translating) {
      return;
    }
    if (event.scale < 0.5) {
      this.End = true;
      this.close();
    } else if (
      event.scale === 1 &&
      (event.translateY > 150 || event.translateY < -150)
    ) {
      this.End = true;
      this.close();
    }
  }

  onTransform(event: object) {
    if (this.End || !this.notFirst || this.translating) {
      return;
    }
    if (event.scale < 1) {
      this.opacity.setValue(150 * event.scale - 150);
    } else if (event.scale === 1) {
      this.opacity.setValue(
        event.translateY < 0 ? event.translateY : event.translateY * -1
      );
    }
  }

  measurement(callBack = () => {}) {
    if (!this.viewer) {
      return;
    }
    this.viewer.measure(
      (
        a: number,
        b: number,
        width: number,
        height: number,
        px: number,
        py: number
      ): any => {
        console.log("TESSST", width, height, a, b, px, py);
        this.setState(
          {
            sourceImageX: px,
            sourceImageY: Platform.select({ ios: py, android: py - 24 }),
            sourceImageHeight: height,
            sourceImageWidth: width
          },
          () => callBack()
        );
      }
    );
  }

  onChildPress() {
    if (this.showOptions) {
      this.optionsOpacity.setValue(0);
      // StatusBar.setHidden(true)
    } else {
      this.optionsOpacity.setValue(1);
      // StatusBar.setHidden(false)
    }
    this.showOptions = !this.showOptions;
  }

  render() {
    const {
      style,
      children,
      topBar,
      bottomBar,
      bottomBarStyle,
      topBarStyle
    } = this.props;
    const {
      sourceImageY,
      sourceImageX,
      sourceImageWidth,
      sourceImageHeight,
      opened,
      enableTransform
    } = this.state;
    const opacity = this.opened
      ? this.opacity.interpolate({
          inputRange: [-200, 0, 200],
          outputRange: [0, 1, 0]
        })
      : 0;
    const animatedViewStyle = [
      style,
      {
        position: "absolute",
        top: sourceImageY,
        left: sourceImageX,
        width: sourceImageWidth,
        height: sourceImageHeight
      },
      {
        transform: [
          { scale: this.scaleLevel },
          { translateX: this.translateX },
          { translateY: this.translateY }
        ]
      }
    ];
    return (
      <View style={filler}>
        <View
          renderToHardwareTextureAndroid
          ref={ref => (this.viewer = ref)}
          style={style}
        >
          <TouchableOpacity
            style={filler}
            activeOpacity={1}
            onPress={() => this.measurement(this.open)}
          >
            <Animated.View
              style={[
                {
                  flex: 1,
                  opacity: this.sourceOpacity
                },
                {
                  transform: [
                    { scale: this.scaleLevel },
                    { translateX: this.translateX },
                    { translateY: this.translateY }
                  ]
                }
              ]}
            >
              {children}
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Modal onRequestClose={() => this.close()} transparent visible={opened}>
          <View style={filler}>
            <Animated.View style={[styles.blackOverlay, { opacity }]} />
            <TransformView
              maxScale={1.7}
              singleTapUp={this.onChildPress}
              onViewTransformed={this.onTransform}
              maxOverScrollDistance={0}
              enableTransform={enableTransform}
              ref={ref => {
                this.transformView = ref;
              }}
              onTransformGestureReleased={this.onTransformGestureReleased}
              style={filler}
            >
              <Animated.View
                ref={ref => (this.Viewer = ref)}
                style={animatedViewStyle}
              >
                <View style={filler}>
                  {React.cloneElement(children, { autoPlaye: true })}
                </View>
              </Animated.View>
            </TransformView>
            <Animated.View
              style={[
                styles.topBar,
                topBarStyle,
                { opacity: this.optionsOpacity }
              ]}
            >
              {topBar || (
                <View style={styles.topBarInnerContainer}>
                  <TouchableOpacity
                    hitSlop={{
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10
                    }}
                    onPress={this.close}
                    activeOpacity={1}
                  >
                    <Image
                      tintColor="white"
                      style={styles.topBarImageStyle}
                      source={BACKIMG}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>

            <Animated.View
              style={[
                styles.bottomBar,
                bottomBarStyle,
                { opacity: this.optionsOpacity }
              ]}
            >
              {bottomBar}
            </Animated.View>
          </View>
        </Modal>
      </View>
    );
  }
}
const styles = {
  blackOverlay: {
    top: 0,
    left: 0,
    width: Screen.width,
    height: Screen.height,
    position: "absolute",
    backgroundColor: "black"
  },
  topBar: {
    height: 54,
    position: "absolute",
    top: 0,
    width: "100%",
    left: 0,
    overflow: "hidden"
  },
  topBarImageStyle: {
    tintColor: "white",
    width: 24,
    height: 24
  },
  topBarInnerContainer: { flex: 1, padding: 16, flexDirection: "row-reverse" },
  bottomBar: {
    height: 54,
    position: "absolute",
    bottom: 0,
    overflow: "hidden",
    left: 0,
    width: "100%"
  }
};
