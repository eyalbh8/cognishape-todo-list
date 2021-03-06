import { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

//Function to display the current to do list status.
function Items({ done: doneHeading, onPressItem }) {
  const [items, setItems] = useState(null);

  //Function consistenly update the screen by every change that accured in the database 
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  const heading = doneHeading ? "Completed" : "Todo";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#000",
            borderWidth: 1,
            paddTasking: 8,
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [text, setText] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [msg, setMsg] = useState("Task & task's date");

  // Create database if not exists 
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);


  const addTask = (text) => {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cognishape todo list</Text>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite is not supported on web!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.flexRow}>
            <TextInput
              placeholder={msg}
              onChangeText={(text) => {
                if(msg === "Task & task's date") {
                  setText(text);
                  } else {
                    setText(msg);
                    setMsg("Task & task's date")
                  }
              }}
                
              onSubmitEditing={() => {
                addTask(text);
                setMsg("Task & task's date")
                setText(null);
              }}
              style={styles.input}
              value={text}
            />
          </View>
          <ScrollView style={styles.listArea}>
            <Items
              key={`forceupdate-todo-${forceUpdateId}`}
              done={false}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`update items set done = 1 where id = ?;`, [
                      id,
                    ]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
            <Items
              done
              key={`forceupdate-done-${forceUpdateId}`}
              // Dialog with to check if they wnt to delete or edit the task 
              onPressItem={(id) => Alert.alert(
                                    "",
                                    "Do you want to edit or delete?",
                                    [
                                      {
                                        text: "Delete",
                                        onPress: () => db.transaction(
                                                          (tx) => {
                                                            tx.executeSql(`delete from items where id = ?;`, [id]);
                                                          },
                                                          null,
                                                          forceUpdate
                                                        )
                                      },
                                      {
                                        text: "Edit",
                                        onPress: () => {
                                          db.transaction(
                                              (tx) => {
                                                tx.executeSql(`update items set done = 0 where id = ?;`, [id,]);
                                              },
                                              null,
                                              forceUpdate
                                            )
                                      },
                                      style: 'cancel'
                                      }
                                    ]
                                    )}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddTaskingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffc107"
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#ffc107",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    paddTasking: 8,
  },
  listArea: {
    backgroundColor: "#ffc107",
    flex: 1,
    paddTaskingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});