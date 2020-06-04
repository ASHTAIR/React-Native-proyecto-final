import React, { Component } from 'react';
import { StyleSheet, FlatList, Alert, TouchableHighlight, Animated, Text, View } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';
import { baseUrl } from '../comun/comun';
import { connect } from 'react-redux';
import { IndicadorActividad } from './IndicadorActividadComponent';
import { borrarFavorito } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
        excursiones: state.excursiones,
        favoritos: state.favoritos,
    }
}

const mapDispatchToProps = dispatch => ({
    borrarFavorito: (excursionId) => dispatch(borrarFavorito(excursionId)),
})

class VistaFavoritos extends Component {

    constructor(props) {
        super(props)

        this.nuevaanimacion = new Animated.ValueXY({ x: 10, y: 10 })
        this.state = {
            derecha: true,
        };
    }

    _mover = () => {
        if (this.state.derecha) {
            Animated.spring(this.nuevaanimacion, {
                toValue: { x: 300, y: 10 },
            }).start()
            this.setState({ derecha: false });
        } else {
            Animated.spring(this.nuevaanimacion, {
                toValue: { x: 10, y: 10 },
            }).start()
            this.setState({ derecha: true });
        }
    }


    borrarFavorito(excursionId) {
        this.props.borrarFavorito(excursionId);
    }

    render() {
        const { navigate } = this.props.navigation;

        const renderFavoritoItem = ({ item, index }) => {

            const Alerta = () => {
                Alert.alert(
                    "¿Borrar excursión favorita?",
                    "Confirme que desea borrar la excursión: " + item.nombre,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => console.log(item.nombre + " Favorito no borrado"),
                            style: "cancel"
                        },
                        { text: "OK", onPress: () => this.borrarFavorito(item.id) }
                    ],
                    { cancelable: false }
                );
            }

            const rightButton = [
                {
                    text: 'Borrar',
                    type: 'delete',
                    onPress: () => Alerta(item.id)
                }
            ];

            return (
                <Swipeout right={rightButton} autoClose={true}>
                    <TouchableHighlight onLongPress={Alerta} onPress={() => navigate('DetalleExcursion', { excursionId: item.id })}>
                        <ListItem
                            key={index}
                            title={item.nombre}
                            subtitle={item.descripcion}
                            hideChevron={true}
                            leftAvatar={{ source: { uri: baseUrl + item.imagen } }}
                        />
                    </TouchableHighlight>
                </Swipeout>
            );
        }

        if (this.props.excursiones.isLoading) {
            return (
                <IndicadorActividad />
            );
        }

        else if (this.props.excursiones.errMess) {
            return (
                <View>
                    <Text>{this.props.excursiones.errMess}</Text>
                </View>
            );
        }
        else {
            return (
                <View>
                    <Animated.View style={[styles.tennisBall, this.nuevaanimacion.getLayout()]}>
                        <TouchableHighlight style={styles.button} onPress={this._mover}>
                            <Icon
                                name='heart'
                                type='font-awesome'
                                size={36}
                                color='red'
                            />
                        </TouchableHighlight>
                    </Animated.View>
                    <FlatList
                        data={this.props.excursiones.excursiones.filter((excursion) => this.props.favoritos.includes(excursion.id))}
                        renderItem={renderFavoritoItem}
                        keyExtractor={item => item.id.toString()}
                    />
                </View>
            );
        }

    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ecf0f1',
    },
    tennisBall: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 52, 52, 0)',
        borderRadius: 30,
        width: 40,
        height: 50,
    },
    button: {
        paddingTop: 10,
        paddingBottom: 35,
    },
    buttonText: {
        fontSize: 24,
        color: '#333',
    }
});


export default connect(mapStateToProps, mapDispatchToProps)(VistaFavoritos);