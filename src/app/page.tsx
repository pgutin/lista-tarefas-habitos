"use client"

import { useState, useEffect } from "react"
import { Plus, Check, X, Calendar, Target, Trash2, Edit2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

interface Habit {
  id: string
  name: string
  description: string
  streak: number
  completedToday: boolean
  completedDates: string[]
  createdAt: Date
  target: number
}

export default function TaskHabitTracker() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [newTask, setNewTask] = useState("")
  const [newHabit, setNewHabit] = useState({ name: "", description: "", target: 1 })
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    const savedHabits = localStorage.getItem('habits')
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt)
      })))
    }
    
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits).map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt)
      })))
    }
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  // Funções para tarefas
  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date(),
        priority: taskPriority
      }
      setTasks([task, ...tasks])
      setNewTask("")
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const updateTask = (id: string, newText: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, text: newText } : task
    ))
    setEditingTask(null)
  }

  // Funções para hábitos
  const addHabit = () => {
    if (newHabit.name.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit.name.trim(),
        description: newHabit.description.trim(),
        streak: 0,
        completedToday: false,
        completedDates: [],
        createdAt: new Date(),
        target: newHabit.target
      }
      setHabits([habit, ...habits])
      setNewHabit({ name: "", description: "", target: 1 })
    }
  }

  const toggleHabit = (id: string) => {
    const today = new Date().toDateString()
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const wasCompletedToday = habit.completedToday
        const newCompletedDates = wasCompletedToday 
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today]
        
        const newStreak = wasCompletedToday 
          ? Math.max(0, habit.streak - 1)
          : habit.streak + 1

        return {
          ...habit,
          completedToday: !wasCompletedToday,
          completedDates: newCompletedDates,
          streak: newStreak
        }
      }
      return habit
    }))
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id))
  }

  const resetHabitStreak = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, streak: 0, completedToday: false, completedDates: [] } : habit
    ))
  }

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ))
    setEditingHabit(null)
  }

  // Estatísticas
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const completedHabitsToday = habits.filter(habit => habit.completedToday).length
  const totalHabits = habits.length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Produtividade
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas tarefas e monitore seus hábitos
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tarefas</p>
                  <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
              {totalTasks > 0 && (
                <Progress value={(completedTasks / totalTasks) * 100} className="mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hábitos Hoje</p>
                  <p className="text-2xl font-bold">{completedHabitsToday}/{totalHabits}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              {totalHabits > 0 && (
                <Progress value={(completedHabitsToday / totalHabits) * 100} className="mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maior Sequência</p>
                  <p className="text-2xl font-bold">
                    {habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{totalTasks - completedTasks}</p>
                </div>
                <X className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="habits">Hábitos</TabsTrigger>
          </TabsList>

          {/* Aba de Tarefas */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Tarefa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Digite sua tarefa..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="flex-1"
                  />
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                  <Button onClick={addTask} className="sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className={`transition-all ${task.completed ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      
                      {editingTask === task.id ? (
                        <Input
                          defaultValue={task.text}
                          onBlur={(e) => updateTask(task.id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateTask(task.id, (e.target as HTMLInputElement).value)
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.text}
                        </span>
                      )}
                      
                      <Badge variant={getPriorityBadge(task.priority) as any}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {tasks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa ainda. Adicione uma acima!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Aba de Hábitos */}
          <TabsContent value="habits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Hábito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Nome do hábito..."
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Descrição (opcional)..."
                      value={newHabit.description}
                      onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Meta diária:</label>
                      <Input
                        type="number"
                        min="1"
                        value={newHabit.target}
                        onChange={(e) => setNewHabit({...newHabit, target: parseInt(e.target.value) || 1})}
                        className="w-20"
                      />
                    </div>
                    <Button onClick={addHabit} className="sm:ml-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Hábito
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {habits.map((habit) => (
                <Card key={habit.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        {editingHabit === habit.id ? (
                          <div className="space-y-2">
                            <Input
                              defaultValue={habit.name}
                              onBlur={(e) => updateHabit(habit.id, { name: e.target.value })}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateHabit(habit.id, { name: (e.target as HTMLInputElement).value })
                                }
                              }}
                              autoFocus
                            />
                            <Input
                              defaultValue={habit.description}
                              onBlur={(e) => updateHabit(habit.id, { description: e.target.value })}
                              placeholder="Descrição..."
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg">{habit.name}</h3>
                            {habit.description && (
                              <p className="text-muted-foreground text-sm">{habit.description}</p>
                            )}
                          </>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="outline">
                            🔥 {habit.streak} dias
                          </Badge>
                          <Badge variant={habit.completedToday ? "default" : "secondary"}>
                            {habit.completedToday ? "✅ Feito hoje" : "⏳ Pendente"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant={habit.completedToday ? "default" : "outline"}
                          onClick={() => toggleHabit(habit.id)}
                          className="min-w-[100px]"
                        >
                          {habit.completedToday ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Feito
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Marcar
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingHabit(editingHabit === habit.id ? null : habit.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetHabitStreak(habit.id)}
                          title="Resetar sequência"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHabit(habit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {habits.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhum hábito ainda. Adicione um acima!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}