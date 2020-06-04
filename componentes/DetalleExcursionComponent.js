import React, { Component, useRef } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, PanResponder, Alert } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { baseUrl } from '../comun/comun';
import { connect } from 'react-redux';
import { postFavorito, postComentario } from '../redux/ActionCreators';
import { colorGaztaroaOscuro } from '../comun/comun';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        excursiones: state.excursiones,
        comentarios: state.comentarios,
        favoritos: state.favoritos,
    }
}

function RenderExcursion(props) {

    const excursion = props.excursion;

    const cardAnimada = useRef(null);

    const reconocerDragDerechaIzquierda = ({ moveX, moveY, dx, dy }) => {
        if (dx < -50)
            return true;
        else
            return false;
    }

    const reconocerDragIzquierdaDerecha = ({ moveX, moveY, dx, dy }) => {
        if (dx > 50)
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            cardAnimada.current.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'terminado' : 'cancelado'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("PanResponder finalizado", gestureState);
            if (reconocerDragDerechaIzquierda(gestureState))
                Alert.alert(
                    'Añadir favorito',
                    'Confirmar que desea añadir' + excursion.nombre + ' a favoritos:',
                    [
                        { text: 'Cancelar', onPress: () => console.log('Excursión no añadida a favoritos'), style: 'cancel' },
                        { text: 'OK', onPress: () => { props.favorita ? console.log('La excursión ya se encuentra entre las favoritas') : props.fav() } },
                    ],
                    { cancelable: false }
                );
            if (reconocerDragIzquierdaDerecha(gestureState)) {
                props.form();
            }
            return true;
        }
    })

    if (excursion != null) {
        return (
            <Animatable.View
                animation="fadeInDown"
                duration={2000}
                delay={500}
                ref={cardAnimada}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={excursion.nombre}
                    image={{ uri: baseUrl + excursion.imagen }}>
                    <Text style={{ margin: 10 }}>
                        {excursion.descripcion}
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                        <Icon
                            raised
                            reverse
                            name={props.favorita ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorita ? console.log('La excursión ya se encuentra entre las favoritas') : props.fav()}
                        />
                        <Icon
                            raised
                            reverse
                            name={props.modal ? 'pencil' : 'pencil'}
                            type='font-awesome'
                            color={colorGaztaroaOscuro}
                            onPress={() => props.modal ? console.log('Nuevo comentario') : props.form()}
                        />
                    </View>

                </Card>
            </Animatable.View>
        );
    }
    else {
        return (<View></View>);
    }
}

function RenderComentario(props) {

    const comentarios = props.comentarios;

    const renderCommentarioItem = ({ item, index }) => {

        return (
            <View key={index} style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.comentario}</Text>
                <Text style={{ fontSize: 12 }}>{item.valoracion} Stars</Text>
                <Text style={{ fontSize: 12 }}>{'-- ' + item.autor + ', ' + item.dia} </Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comentarios' >
                <FlatList
                    data={comentarios}
                    renderItem={renderCommentarioItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

const mapDispatchToProps = dispatch => ({
    postFavorito: (excursionId) => dispatch(postFavorito(excursionId)),
    postComentario: (comentario) => dispatch(postComentario(comentario)),
})


class DetalleExcursion extends Component {

    constructor(props) {
        super(props);

        this.state = {
            autor: '',
            comentario: '',
            showModal: false,
            valoracion: 3,
        };
    }

    marcarFavorito(excursionId) {
        this.props.postFavorito(excursionId);
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    resetForm() {
        this.setState({
            autor: '',
            comentario: '',
            valoracion: 3,
            showModal: false,
        });
    }

    gestionarComentario() {
        const { excursionId } = this.props.route.params;
        const newComentario = {
            excursionId: excursionId,
            valoracion: this.state.valoracion,
            autor: this.state.autor,
            comentario: this.state.comentario,
        };

        newComentario.dia = new Date().toISOString();
        this.props.postComentario(newComentario);
    }

    render() {
        const { excursionId } = this.props.route.params;
        return (
            <ScrollView>
                <RenderExcursion
                    excursion={this.props.excursiones.excursiones[+excursionId]}
                    favorita={this.props.favoritos.some(el => el === excursionId)}
                    modal={this.state.showModal}
                    fav={() => this.marcarFavorito(excursionId)}
                    form={() => this.toggleModal()}
                />
                <RenderComentario
                    comentarios={this.props.comentarios.comentarios.filter((comentario) => comentario.excursionId === excursionId)}
                />
                <Modal animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => { this.toggleModal(); this.resetForm(); }}
                    onRequestClose={() => { this.toggleModal(); this.resetForm(); }}>
                    <View style={styles.modal}>
                        <Rating showRating fractions={0} startingValue={3}
                            onFinishRating={rating => this.setState({ valoracion: rating })} />
                    </View>
                    <View style={styles.modal}>
                        <Input leftIcon={{ type: 'font-awesome', name: 'user', size: 30 }}
                            placeholder="    Autor"
                            onChangeText={text => this.setState({ autor: text })}
                        ></Input>
                    </View>
                    <View style={styles.modal}>
                        <Input leftIcon={{ type: 'font-awesome', name: 'envelope', size: 26 }}
                            placeholder="   Comentario"
                            onChangeText={text => this.setState({ comentario: text })}
                        ></Input>
                    </View>
                    <View style={styles.modal}>
                        <Button
                            onPress={() => { this.gestionarComentario(); this.resetForm(); }}
                            color={colorGaztaroaOscuro}
                            title="Envíar"
                        />
                    </View>
                    <View style={styles.modal}>
                        <Button
                            onPress={() => { this.toggleModal(); this.resetForm(); }}
                            color='red'
                            title="Cancelar"
                        />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        marginHorizontal: 40,
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10,
    },
    input: {
        padding: 10,
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(DetalleExcursion);
