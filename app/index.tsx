import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert, StyleSheet, ScrollView, Dimensions } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Index() {
  const [task, setTask] = useState('');
  const [value, setValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(0);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(resetTotalToday, 24 * 60 * 60 * 1000); // 24 hours
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks, total, experience, level, totalToday]);

  const saveTasks = async () => {
    try {
      const data = JSON.stringify({ tasks, total, experience, level, totalToday });
      await AsyncStorage.setItem('tasksData', data);
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem('tasksData');
      if (data !== null) {
        const { tasks, total, experience, level, totalToday } = JSON.parse(data);
        setTasks(tasks);
        setTotal(total);
        setExperience(experience);
        setLevel(level);
        setTotalToday(totalToday);
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const resetTotalToday = () => {
    setTotalToday(0);
  };

  const addTask = () => {
    if (task === '' || value === '') {
      Alert.alert('Cannot Be Empty!!', 'Enter a task and a value to add to the list =)');
      return;
    }
    setTasks([...tasks, { key: Math.random().toString(), text: task, value: parseInt(value) }]);
    setTask('');
    setValue('');
  };

  const editTask = (item) => {
    Alert.prompt('Edit task!', item.text, (newText) => {
      if (newText === null || newText === '') {
        return;
      }
      setTasks(tasks.map(t => t.key === item.key ? { ...t, text: newText } : t));
    });
  };

  const removeTask = (item) => {
    setTasks(tasks.filter(t => t.key !== item.key));
  };

  const addToTotal = (value) => {
    setTotal(total + value);
    setTotalToday(totalToday + value);
    addExperience(value);
  };

  const subtractFromTotal = (value) => {
    setTotal(total - value);
    setTotalToday(totalToday - value);
    addExperience(-value);
  };

  const addExperience = (value) => {
    const newExperience = experience + value;
    const nextLevelExp = Math.floor(100 * Math.pow(1.01, level));
    if (newExperience >= nextLevelExp) {
      setLevel(level + 1);
      setExperience(newExperience - nextLevelExp);
    } else {
      setExperience(newExperience);
    }
  };

  const nextLevelExp = Math.floor(100 * Math.pow(1.01, level));

  const renderItem = ({ item, drag, isActive }) => (
    <TouchableOpacity
      style={[
        styles.taskContainer,
        { backgroundColor: isActive ? '#f0f0f0' : '#fff' }
      ]}
      onLongPress={drag}
    >
      <TouchableOpacity
        style={[styles.taskValueButton, { backgroundColor: item.value >= 0 ? 'green' : 'red' }]}
        onPress={() => addToTotal(item.value)}
      >
        <Text style={styles.taskValueText}>{item.value >= 0 ? '+' : '-'}{Math.abs(item.value)}</Text>
      </TouchableOpacity>
      <Text style={styles.taskText}>{item.text}</Text>
      <TouchableOpacity onPress={() => editTask(item)}>
        <Text style={styles.editButton}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeTask(item)}>
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => subtractFromTotal(item.value)}>
        <Text style={styles.undoButton}>Undo</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Button title="SKILLS" onPress={() => Alert.alert('Skills Button Pressed')} />
        <Text style={styles.title}>Quests</Text>

        <View style={styles.listContainer}>
          <DraggableFlatList
            data={tasks}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setTasks(data)}
          />
        </View>

        <ScrollView contentContainerStyle={styles.footerContainer}>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.valueInput}
            placeholder="XP"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            maxLength={5}
          />
          <TextInput
            style={styles.taskInput}
            placeholder="Enter a task"
            value={task}
            onChangeText={setTask}
          />
        </View>
        <Button title="Add Task" onPress={addTask} />
          <View style={styles.experienceBar}>
            <View style={{ ...styles.experienceFill, width: `${(experience / nextLevelExp) * 100}%` }} />
            <Text style={styles.experienceText}>{experience} / {nextLevelExp}</Text>
          </View>
          <Text style={styles.levelText}>Level: {level}</Text>
          <Text style={styles.totalText}>Total XP: {total}</Text>
          <Text style={styles.totalToday}>Today's XP: {totalToday}</Text>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const setVW = (percentage) => Dimensions.get('window').width * (percentage / 100);
const setVH = (percentage) => Dimensions.get('window').height * (percentage / 100);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  valueInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: 80,
    marginRight: 10,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  listContainer: {
    flex: 7,
    marginBottom: "auto",
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskValueButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 5,
  },
  taskValueText: {
    color: '#fff',
  },
  taskText: {
    flex: 1,
    marginLeft: 10,
  },
  editButton: {
    color: 'blue',
    marginRight: 10,
  },
  removeButton: {
    color: 'red',
    marginRight: 10,
  },
  undoButton: {
    color: 'orange',
  },
  experienceBar: {
    height: 20,
    backgroundColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  experienceFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  experienceText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#fff',
  },
  levelText: {
    fontSize: 20,
    marginTop: 10,
  },
  totalText: {
    fontSize: 20,
    marginTop: 10,
  },
  totalToday: {
    fontSize: 20,
    marginTop: 10,
  },
  footerContainer: {
    marginTop: "auto",
    paddingBottom: 20,
  },
});