import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from './colors';

const STORAGE_KEY = "@toDos"
const WORK_STORAGE_KEY = "@work"

export default function App() {
  const [working, setWorking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({key: null, tf: false});
  const [text, setText] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [toDos, setToDos] = useState({});
  
  useEffect(() => {
    setLoading(true);
    loadToDos();
    async function loadWorking() {
      try {
        const s = await AsyncStorage.getItem(WORK_STORAGE_KEY);
        setWorking(JSON.parse(s));
      } catch (e) {
        console.log(e);
      }
    };
    loadWorking();
  }, []);

  const travel = async () => {
    setWorking(false);
    try {
      await AsyncStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(!working));
      const s = await AsyncStorage.getItem(WORK_STORAGE_KEY);
    } catch (e) {
      console.log(e);
    }
  }
  const work = async () => {
    setWorking(true);
    try {
      await AsyncStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(!working));
      const s = await AsyncStorage.getItem(WORK_STORAGE_KEY);
    } catch (e) {
      console.log(e);
    }
  }
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
    setLoading(false);
  };
  const addToDo = async () => {
    if(text === "") {
      return;
    }
    const newToDo = {
      ...toDos,
      [Date.now()]: {text, working}
    };
    setToDos(newToDo);
    await saveToDos(newToDo);
    setText("");
  };
  const deleteToDo = async (key) => {
    Alert.alert(
      "Delete ToDo",
      "Are you sure?", [
        {text:"Cancel"},
        {
          text:"I'm sure", 
          onPress: () => {
            const newToDo = {...toDos};
            delete newToDo[key];
            setToDos(newToDo);
            saveToDos(newToDo);
          },
        },
    ]);
    return;
  };
  const focusUpdateToDo = (key) => {
    setUpdating({ key, tf: true});
  };
  const updateTodo = (key) => {
    setUpdateText("");
    setUpdating({key: null, tf: false});
    const newToDo = {...toDos};
    newToDo[key].text = updateText;
    setToDos(newToDo);
    saveToDos(newToDo);
  }
  const onChangeUpdateText = (payload) => setUpdateText(payload);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? theme.white : theme.gray }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: working ? theme.gray : theme.white }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      {
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color="white"
              size="large"
              style={{marginBottom: 100}}
            />
          </View>
        ) : (
          <ScrollView>{
            Object.keys(toDos).map(key => (
              toDos[key].working === working ? (
                <View style={styles.toDo} key={key}>
                  <TouchableOpacity onPress={() => focusUpdateToDo(key)}>
                    { updating.tf === true && updating.key === key ? (
                      <TextInput
                        autoFocus={true}
                        returnKeyType="done"
                        value={updateText}
                        placeholder={toDos[key].text}
                        style={styles.update}
                        onChangeText={onChangeUpdateText}
                        onBlur={() => updateTodo(key)}
                      />
                    ) : (
                      <Text style={styles.toDoText}>{toDos[key].text}</Text>
                    ) }
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Text><Fontisto name="trash" size={18} color={theme.gray} /></Text>
                  </TouchableOpacity>
                </View>
              ): null
            ))
          }</ScrollView>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 70
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  update: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10
  }
});
