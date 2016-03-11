/**
 * Created by wenxucheng@163.com on 16/3/2.

    BaseComponent 是所有 Component 的基类

 */
'use strict';

import React, {
    Component,
    StyleSheet,
    Text,
    View,
    Dimensions
} from 'react-native';

import {
    Resource,
    TitleBar,
    Loading
} from 'easier-react-native'

class BaseComponent extends Component {

    constructor(props) {
        super(props);

        this.SCREEN_WIDTH = Dimensions.get('window').width;
        this.SCREEN_HEIGHT = Dimensions.get('window').height;

        this.titleBarConfig = this.titleBarConfig();

        this.state = {
            body: undefined,
            pointerEvents: false
        }

    }

    render() {
        if (!this.props.navigator) {
            return (
                <View style={styles.containerCenter}>
                    <Text>The component is not init!</Text>
                </View>
            );
        }

        //get TitleBar configuration
        if (!this.titleBarConfig) {
            this.titleBarConfig = {
                title: {
                    title: ''
                }
            }
        }

        if (this.props.navigator.getCurrentRoutes().length > 1) {
            this.titleBarConfig.leftButton = {
                ...this._getBackButtonConfig(this.titleBarConfig.leftButton),
                ...this.titleBarConfig.leftButton
            };
        }

        return (
            <View style={styles.container}>
                <TitleBar
                    ref = 'title'
                    {...this.titleBarConfig}
                    title = {{
                            ...this.titleBarConfig.title,
                            title: this.title ? this.title : this.titleBarConfig.title && this.titleBarConfig.title.title ? this.titleBarConfig.title.title : ''
                    }}
                    navigator={this.props.navigator}
                />
                <View style={styles.body}>
                    {this.state.body === undefined ? this.renderBody() : this.state.body}
                    <Loading ref='loading' />
                </View>
            </View>
        );
    }

    getTitleBar() {
        return this.refs['title'];
    }

    setTitleBar(props) {
        this.titleBarConfig = props;
    }

    titleBarConfig() {
        return {};
    }

    renderBody() {
        return (<View />);
    }

    setBody(body) {
        this.setState({
            body: body
        });
    }

    setTitle(title) {
        if (this.state.title) {
            this.setState({
                title: title
            });
        }
    }

    startComponent(name, props) {
        if(this.props.navigator) {
            let isList = name.indexOf('.') != -1;
            let component = null;
            if (isList) {
                let names = isList ? name.split('.') : '';
                component = Resource[names[0]];
                for (let i = 1; i < names.length; i++) {
                    component = component[names[i]];
                }
            } else {
                component = Resource[name];
            }
            if (!!props && props.isTop) {
                let newRoutes = [];
                this.props.navigator.immediatelyResetRouteStack(newRoutes);
            }
            this.props.navigator.push({
                name: name,
                component: component,
                props: props
            })
        }
    }

    finish(name) {
        if(this.props.navigator) {
            this.props.navigator.pop();
        }
    }

    finishToBefore(name, props, index) {
        if(this.props.navigator) {
            let routes = this.props.navigator.getCurrentRoutes();
            let hasRoute = null;
            for (let i in routes) {
                if (routes[i]['name'] == name) {
                    hasRoute = routes[i];
                    break;
                }
            }
            if (hasRoute) {
                this.props.navigator.popToRoute(hasRoute);
            } else {
                let Component = Resource[name];
                let newRoute = {
                    name: name,
                    component: Component,
                    props: props
                };
                if (!index) {
                    // this.props.navigator.replace(newRoute);
                    index = routes.length > 2 ? routes.length - 2 : 0
                }
                this.props.navigator.replaceAtIndex(newRoute, index);
                this.props.navigator.popToRoute(newRoute);
            }
        }
    }

    getLoading() {
        return this.refs['loading'];
    }

    _getBackButtonConfig(props) {
        return {
            pressSource: require('./images/titlebar_btn_back_press.png'),
            source: require('./images/titlebar_btn_back.png'),
            imgStyle: styles.btnBackImage,
            onPress: ()=> {
                if (props && props.handler) {
                    if (props.handler()) {
                        return;
                    }
                }
                this.finish();
            }
        };
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF'
    },
    containerCenter: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    body: {
        backgroundColor: 'transparent',
        flex: 1
    },
    btnBackImage: {
        width: 12,
        height: 20,
    }
});

module.exports = BaseComponent