<template>
  <div class="page-wrapper">
    <div class="cuestionario-container">
      <div class="header">
        <h1 class="title">Módulo de Cuestionario</h1>
        <div class="mode-switch" v-if="!isStudent">
          <button 
            :class="['btn', { active: isTeacherMode }]" 
            @click="isTeacherMode = true"
          >
            Modo Docente
          </button>
          <button 
            :class="['btn', { active: !isTeacherMode }]" 
            @click="startStudentMode"
          >
            Modo Estudiante
          </button>
        </div>
        <div class="mode-switch" v-else>
           <span class="student-label">Modo Estudiante</span>
        </div>
      </div>

      <!-- Modo Docente (Edición) -->
      <div v-if="isTeacherMode" class="teacher-mode">
        <div class="instructions">
          <p>Añade preguntas, especifica las 4 opciones de respuesta y selecciona cuál es la correcta mediante el botón circular (radio).</p>
        </div>

        <div v-for="(question, qIndex) in questions" :key="question.id" class="question-block">
          <div class="question-header">
            <h3>Pregunta {{ qIndex + 1 }}</h3>
            <button @click="removeQuestion(qIndex)" class="btn-danger" v-if="questions.length > 1">Eliminar</button>
          </div>
          
          <div class="form-group">
            <label>Enunciado:</label>
            <textarea v-model="question.text" placeholder="Escribe el enunciado de la pregunta aquí..." rows="3"></textarea>
          </div>

          <div class="options-container">
            <label>Opciones de respuesta (Marca la correcta):</label>
            <div v-for="(option, oIndex) in question.options" :key="option.id" class="option-item">
              <input 
                type="radio" 
                :name="`correct-option-${question.id}`" 
                :value="option.id" 
                v-model="question.correctOptionId"
                title="Marcar como respuesta correcta"
              />
              <input 
                type="text" 
                v-model="option.text" 
                :placeholder="`Opción ${oIndex + 1}`" 
                :class="{ 'is-correct': question.correctOptionId === option.id }"
              />
            </div>
          </div>
          <div class="error-msg" v-if="!question.correctOptionId">
            * Debes seleccionar una respuesta correcta.
          </div>
        </div>

        <div class="actions">
          <button @click="addQuestion" class="btn-primary">+ Añadir Pregunta</button>
          <button @click="saveCuestionario" class="btn-success" style="margin-left: 10px;">Guardar</button>
        </div>
      </div>

      <!-- Modo Estudiante (Visualización y Resolución) -->
      <div v-else class="student-mode">
        
        <!-- Vista del cuestionario activo -->
        <div v-if="!showResults" class="quiz-container">
          <div v-if="noQuestionsAvailable" class="alert-msg">
            No hay preguntas disponibles o el cuestionario está incompleto. Consulta con el docente.
          </div>
          <div v-else>
            <div v-for="(question, qIndex) in studentQuestions" :key="question.id" class="question-block">
              <h3>{{ qIndex + 1 }}. {{ question.text }}</h3>
              
              <div class="student-options">
                <label 
                  v-for="option in question.options" 
                  :key="option.id" 
                  class="student-option-label"
                  :class="{ 'selected': studentAnswers[question.id] === option.id }"
                >
                  <input 
                    type="radio" 
                    :name="`student-answer-${question.id}`" 
                    :value="option.id" 
                    v-model="studentAnswers[question.id]"
                  />
                  <span class="option-text">{{ option.text }}</span>
                </label>
              </div>
            </div>
            
            <div class="actions">
              <button 
                @click="submitAnswers" 
                class="btn-success" 
                :disabled="Object.keys(studentAnswers).length < studentQuestions.length"
              >
                Enviar Respuestas
              </button>
            </div>
          </div>
        </div>

        <!-- Vista de Resultados -->
        <div v-else class="results-container">
          <h2>Resultados</h2>
          <div class="score-display">
            Has obtenido {{ score }} de {{ studentQuestions.length }} puntos.
          </div>
          
          <div class="review-questions">
            <div v-for="(question, qIndex) in studentQuestions" :key="question.id" class="question-block review-block">
              <h3>{{ qIndex + 1 }}. {{ question.text }}</h3>
              
              <div class="student-options">
                <label 
                  v-for="option in question.options" 
                  :key="option.id" 
                  class="student-option-label"
                  :class="{ 
                    'correct-answer': option.id === question.correctOptionId,
                    'wrong-answer': studentAnswers[question.id] === option.id && option.id !== question.correctOptionId
                  }"
                >
                  <input 
                    type="radio" 
                    disabled
                    :checked="studentAnswers[question.id] === option.id"
                  />
                  <span class="option-text">{{ option.text }}</span>
                  <span v-if="option.id === question.correctOptionId" class="badge correct">Correcta</span>
                  <span v-if="studentAnswers[question.id] === option.id && option.id !== question.correctOptionId" class="badge wrong">Tu respuesta</span>
                </label>
              </div>
            </div>
          </div>

          <div class="actions">
            <button @click="startStudentMode" class="btn-primary">Reintentar</button>
            <button v-if="!isStudent" @click="backToTeacherMode" class="btn">Volver a Edición</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePerfilesStore } from '~/store/perfiles'

const store = usePerfilesStore()
const isStudent = computed(() => store.currentPerfil?.rol === 'Estudiante')

const isTeacherMode = ref(true)

// Función auxiliar para generar IDs únicos (esto garantiza la persistencia sin importar la posición)
const generateId = () => Math.random().toString(36).substring(2, 9)

// Estado principal (Modo Docente)
const questions = ref([
  {
    id: generateId(),
    text: '',
    options: [
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
    ],
    correctOptionId: null
  }
])

const addQuestion = () => {
  questions.value.push({
    id: generateId(),
    text: '',
    options: [
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
    ],
    correctOptionId: null
  })
}

const removeQuestion = (index) => {
  questions.value.splice(index, 1)
}

const saveCuestionario = async () => {
  // Validación opcional antes de guardar
  const isValid = questions.value.every(q => 
    q.text.trim() !== '' && 
    q.options.every(o => o.text.trim() !== '') && 
    q.correctOptionId
  )
  if (!isValid) {
    alert("Recomendación: Hay preguntas incompletas o sin respuesta correcta seleccionada. Asegúrate de completarlas para que los estudiantes puedan resolverlas.")
  }

  try {
    await $fetch('/api/cuestionario', {
      method: 'PUT',
      body: { questions: questions.value }
    })
    alert('Cuestionario guardado correctamente en la base de datos.')
  } catch (error) {
    console.error('Error al guardar el cuestionario:', error)
    alert('Hubo un error al guardar el cuestionario.')
  }
}

// Variables de estado (Modo Estudiante)
const studentQuestions = ref([])
const studentAnswers = ref({})
const showResults = ref(false)
const score = ref(0)
const noQuestionsAvailable = ref(false)

// Función para mezclar arreglos de forma aleatoria (Shuffle - Fisher-Yates)
const shuffleArray = (array) => {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

// Transición al Modo Estudiante
const startStudentMode = () => {
  if (!isTeacherMode.value && !showResults.value && !isStudent.value) return

  // Validación de que todo esté lleno y haya respuesta correcta marcada
  const isValid = questions.value.every(q => 
    q.text.trim() !== '' && 
    q.options.every(o => o.text.trim() !== '') && 
    q.correctOptionId
  )

  if (!isValid || questions.value.length === 0) {
    if (isStudent.value) {
      noQuestionsAvailable.value = true
    } else {
      alert("Por favor, completa todas las preguntas, sus 4 opciones y selecciona la respuesta correcta en cada una antes de probar el cuestionario.")
    }
    return
  }

  noQuestionsAvailable.value = false
  isTeacherMode.value = false
  showResults.value = false
  studentAnswers.value = {}
  score.value = 0

  // Copia profunda y barajar tanto las preguntas como las opciones (Shuffle Obligatorio)
  const shuffledQs = questions.value.map(q => {
    return {
      id: q.id,
      text: q.text,
      correctOptionId: q.correctOptionId, // Se mantiene la referencia mediante el ID
      // Barajar las opciones conservando los IDs originales para persistencia
      options: shuffleArray(q.options)
    }
  })
  
  // Barajar el orden de las preguntas general
  studentQuestions.value = shuffleArray(shuffledQs)
}

const submitAnswers = () => {
  let currentScore = 0
  studentQuestions.value.forEach(q => {
    if (studentAnswers.value[q.id] === q.correctOptionId) {
      currentScore++
    }
  })
  score.value = currentScore
  showResults.value = true
}

const backToTeacherMode = () => {
  if (!isStudent.value) {
    isTeacherMode.value = true
  }
}

onMounted(async () => {
  try {
    const data = await $fetch('/api/cuestionario')
    if (data && data.questions && data.questions.length > 0) {
      questions.value = data.questions
    } else {
      // Fallback a localStorage si no hay nada en la BD
      const saved = localStorage.getItem('cuestionario_preguntas')
      if (saved) {
        try {
          questions.value = JSON.parse(saved)
        } catch (e) {}
      }
    }
  } catch (error) {
    console.error('Error al cargar cuestionario:', error)
  }

  if (isStudent.value) {
    isTeacherMode.value = false
    startStudentMode()
  } else {
    isTeacherMode.value = true
  }
})

watch(questions, (newVal) => {
  if (!isStudent.value) {
    localStorage.setItem('cuestionario_preguntas', JSON.stringify(newVal))
  }
}, { deep: true })
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  padding: 40px 20px;
  box-sizing: border-box;
}

.cuestionario-container {
  width: 100%;
  max-width: 900px;
  background: rgba(0, 0, 0, 0.6);
  border-left: 3px solid #00e5ff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,229,255,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
}

.title {
  color: #00e5ff;
  margin: 0;
  font-size: 1.8rem;
}

.mode-switch {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px;
  border-radius: 6px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background: transparent;
  color: #ccc;
  transition: all 0.3s ease;
}

.btn.active {
  background: #00e5ff;
  color: #0a0a0a;
}

.question-block {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-header h3 {
  margin: 0;
  color: #fff;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label, .options-container > label {
  display: block;
  margin-bottom: 8px;
  color: #ccc;
}

textarea {
  width: 100%;
  padding: 12px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  color: white;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

textarea:focus, input[type="text"]:focus {
  outline: none;
  border-color: #00e5ff;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.option-item input[type="radio"] {
  width: 20px;
  height: 20px;
  accent-color: #00e5ff;
  cursor: pointer;
}

.option-item input[type="text"] {
  flex-grow: 1;
  padding: 10px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  color: white;
  box-sizing: border-box;
}

.option-item input[type="text"].is-correct {
  border-color: #00e5ff;
  box-shadow: 0 0 5px rgba(0,229,255,0.3);
}

.error-msg {
  color: #ff4757;
  font-size: 0.9rem;
  margin-top: 10px;
}

.btn-primary, .btn-danger, .btn-success {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary { background-color: #00e5ff; color: #0a0a0a; }
.btn-primary:hover { background-color: #00b3cc; }

.btn-danger { background-color: #ff4757; color: white; }
.btn-danger:hover { background-color: #ff6b81; }

.btn-success { background-color: #2ed573; color: #0a0a0a; font-size: 1.1rem; }
.btn-success:hover { background-color: #7bed9f; }
.btn-success:disabled { background-color: #57606f; color: #a4b0be; cursor: not-allowed; }

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Modo Estudiante Styles */
.student-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.student-option-label {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-option-label:hover {
  background: rgba(255,255,255,0.1);
}

.student-option-label.selected {
  border-color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
}

.student-option-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #00e5ff;
  cursor: pointer;
}

.score-display {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid #00e5ff;
  border-radius: 8px;
  color: #00e5ff;
}

.correct-answer {
  border-color: #2ed573;
  background: rgba(46, 213, 115, 0.1);
}

.wrong-answer {
  border-color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: auto;
}

.badge.correct { background: #2ed573; color: #0a0a0a; }
.badge.wrong { background: #ff4757; color: white; }

.instructions {
  margin-bottom: 20px;
  color: #aaa;
}

.alert-msg {
  padding: 20px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid #ff4757;
  border-radius: 8px;
  color: #ff4757;
  text-align: center;
  font-weight: bold;
}

.student-label {
  color: #00e5ff;
  font-weight: bold;
  padding: 8px 16px;
}
</style>
