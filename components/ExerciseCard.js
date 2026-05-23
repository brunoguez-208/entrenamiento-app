// components/ExerciseCard.js
import { StyleSheet, Text, View } from 'react-native';

export default function ExerciseCard({ exercise }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.exerciseName}>{exercise.nombre}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{exercise.series}x{exercise.repes}</Text>
        </View>
      </View>
      
      {exercise.descanso && (
        <Text style={styles.descansoText}>⏱️ Descanso: {exercise.descanso}</Text>
      )}
      
      {exercise.nota && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>💡 Nota médica: {exercise.nota}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EAEAEA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  exerciseName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 10 },
  tag: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#0D47A1', fontSize: 12, fontWeight: '700' },
  descansoText: { fontSize: 13, color: '#666', marginBottom: 6 },
  noteBox: { backgroundColor: '#FFF9C4', padding: 8, borderRadius: 6, marginTop: 4 },
  noteText: { fontSize: 12, color: '#F57F17', fontWeight: '500' }
});