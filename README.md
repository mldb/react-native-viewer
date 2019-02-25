# react-native-viewer

## Getting started

`$ npm install react-native-viewer`

### OR

`$ yarn add react-native-viewer`

## Usage

```javascript
import RNViewer from "react-native-viewer";

export default class App extends Component {
  render() {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <View
          style={{
            height: 100,
            width: 100,
          }}
        >
          <RNViewer
            style={{
              height: 100,
              width: 100
            }}
			realSize={{ width: ScreenWidth, height: ScreenWidth }}>
				<MyCustomComponent />
			</RNViewer>
        </View>
      </View>
    );
  }
}
```

## props

| prop           |                     desc                      |                  example |
| -------------- | :-------------------------------------------: | -----------------------: |
| style          |            component general style            |                       {} |
| topBar         |               topBar component                |                 <View /> |
| topBarStyle    |            topBar component style             |                       {} |
| bottomBar      |              bottomBar component              |                 <View /> |
| bottomBarStyle |           bottomBar component style           |                       {} |
| fullScreenSize | childComponent realSize( size in fullScreen ) | { width:300,heigth:300 } |
