// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { db, addDoc, collection } from './firebase'; // Asegúrate de que tengas configurada la base de datos de Firebase

// Lista de frutas (con sus imágenes)
const cartas = [
  { id: 1, imagen: require('./images/manzana.png'), emparejado: false },
  { id: 2, imagen: require('./images/manzana.png'), emparejado: false },
  { id: 3, imagen: require('./images/banana.png'), emparejado: false },
  { id: 4, imagen: require('./images/banana.png'), emparejado: false },
  { id: 5, imagen: require('./images/cereza.png'), emparejado: false },
  { id: 6, imagen: require('./images/cereza.png'), emparejado: false },
  { id: 7, imagen: require('./images/uva.png'), emparejado: false },
  { id: 8, imagen: require('./images/uva.png'), emparejado: false },
  { id: 9, imagen: require('./images/fresa.png'), emparejado: false },
  { id: 10, imagen: require('./images/fresa.png'), emparejado: false },
  { id: 11, imagen: require('./images/naranja.png'), emparejado: false },
  { id: 12, imagen: require('./images/naranja.png'), emparejado: false },
];

function App() {
  const [nombres, setNombres] = useState('');
  const [cartasJuego, setCartasJuego] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [tiempo, setTiempo] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [parejasEncontradas, setParejasEncontradas] = useState(0);
  const [temporizador, setTemporizador] = useState(null);

  useEffect(() => {
    if (jugando) {
      const timer = setInterval(() => setTiempo((prev) => prev + 1), 1000);
      setTemporizador(timer);
      return () => clearInterval(timer);
    }
  }, [jugando]);

  const iniciarJuego = () => {
    if (!nombres.trim()) {
      setMensaje('Por favor ingrese un nombre.');
      return;
    }

    setMensaje('');
    setParejasEncontradas(0);
    setTiempo(0);
    setCartasVolteadas([]);
    setJugando(true);

    // Barajamos las cartas
    const cartasDesordenadas = [...cartas].sort(() => Math.random() - 0.5);
    setCartasJuego(cartasDesordenadas);
  };

  const manejarClick = (carta) => {
    // Si ya ha sido emparejada o si ya tenemos dos cartas volteadas, no hacer nada
    if (carta.emparejado || cartasVolteadas.length === 2) return;

    // Volteamos la carta
    setCartasVolteadas((prev) => [...prev, carta]);

    // Si ya hay dos cartas volteadas, verificamos si coinciden
    if (cartasVolteadas.length === 1) {
      const carta1 = cartasVolteadas[0];
      const carta2 = carta;

      // Si las cartas coinciden
      if (carta1.imagen === carta2.imagen) {
        setParejasEncontradas(parejasEncontradas + 1);
        setCartasJuego((prevCartas) =>
          prevCartas.map((c) =>
            c.imagen === carta1.imagen ? { ...c, emparejado: true } : c
          )
        );
      }

      // Si no coinciden, las volteamos de nuevo
      setTimeout(() => setCartasVolteadas([]), 1000);
    }
  };

  useEffect(() => {
    // Si se han encontrado todas las parejas, termina el juego
    if (parejasEncontradas === cartas.length / 2) {
      setJugando(false);
      setMensaje(`¡Juego Terminado! Tu tiempo fue: ${tiempo} segundos.`);
      guardarResultado();
    }
  }, [parejasEncontradas, tiempo]);

  const guardarResultado = async () => {
    try {
      await addDoc(collection(db, 'resultados'), {
        nombre: nombres,
        tiempo: tiempo,
        fecha: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error al guardar el resultado: ', error);
    }
  };

  const reiniciarJuego = () => {
    setNombres('');
    setMensaje('');
    setParejasEncontradas(0);
    setTiempo(0);
    setCartasVolteadas([]);
    setJugando(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego de Memoria con Frutas</Text>

      {!jugando && (
        <View style={styles.startContainer}>
          <Text>Ingrese su nombre:</Text>
          <TextInput
            style={styles.input}
            value={nombres}
            onChangeText={setNombres}
            placeholder="Ejemplo: Juan"
          />
          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Iniciar Juego</Text>
          </TouchableOpacity>
        </View>
      )}

      {mensaje && <Text>{mensaje}</Text>}

      {jugando && (
        <View style={styles.gameContainer}>
          <Text>Tiempo: {tiempo} segundos</Text>
          <View style={styles.cartasContainer}>
            {cartasJuego.map((carta) => (
              <TouchableOpacity
                key={carta.id}
                style={styles.carta}
                onPress={() => manejarClick(carta)}
                disabled={carta.emparejado || cartasVolteadas.includes(carta)}
              >
                {cartasVolteadas.includes(carta) || carta.emparejado ? (
                  <Image style={styles.imagen} source={carta.imagen} />
                ) : (
                  <Text>?</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {mensaje && !jugando && (
        <TouchableOpacity style={styles.button} onPress={reiniciarJuego}>
          <Text style={styles.buttonText}>Nuevo Juego</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startContainer: {
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: 200,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  gameContainer: {
    alignItems: 'center',
  },
  cartasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  carta: {
    width: 60,
    height: 60,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  imagen: {
    width: 50,
    height: 50,
  },
});

export default App;

