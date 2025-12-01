import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { 
  HelpCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  Eye,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Copy,
  X,
  Loader2
} from 'lucide-react';
import { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../../features/gamification/api/quizService';
import { getProducts } from '../../features/products/api/productService';
import type { Quiz, QuizQuestion, QuizOption, RecommendationRule } from '../../features/gamification/api/quizService';

const QuizManager: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'rules'>('questions');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<{ value: string; label: string }[]>([]);

  // Cargar quizzes y productos desde Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar quizzes
        const quizzesData = await getAllQuizzes();
        setQuizzes(quizzesData);

        // Cargar productos para las reglas
        const productsData = await getProducts({});
        setAvailableProducts(
          productsData.map(p => ({
            value: p.id,
            label: p.name,
          }))
        );
      } catch (err) {
        console.error('Error loading quizzes:', err);
        setError('Error al cargar los quizzes. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateQuiz = () => {
    const newQuiz: Quiz = {
      id: '', // Se generará en el servidor
      name: 'Nuevo Quiz',
      description: '',
      isActive: false,
      questions: [],
      rules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedQuiz(newQuiz);
    setIsEditModalOpen(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsEditModalOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!selectedQuiz) return;
    
    try {
      setIsSaving(true);
      setError(null);

      let savedQuiz: Quiz;
      if (selectedQuiz.id && quizzes.some(q => q.id === selectedQuiz.id)) {
        // Actualizar quiz existente
        savedQuiz = await updateQuiz(selectedQuiz.id, selectedQuiz);
      } else {
        // Crear nuevo quiz
        savedQuiz = await createQuiz(selectedQuiz);
      }

      // Actualizar lista de quizzes
      setQuizzes(prev => {
        const exists = prev.some(q => q.id === savedQuiz.id);
        if (exists) {
          return prev.map(q => q.id === savedQuiz.id ? savedQuiz : q);
        } else {
          return [...prev, savedQuiz];
        }
      });

      setSelectedQuiz(savedQuiz);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError('Error al guardar el quiz. Por favor, intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este quiz?')) {
      return;
    }

    try {
      await deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Error al eliminar el quiz. Por favor, intenta de nuevo.');
    }
  };

  const handleAddQuestion = () => {
    if (!selectedQuiz) return;
    
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      question: '',
      order: selectedQuiz.questions.length + 1,
      isActive: true,
      options: [],
    };
    
    setEditingQuestion(newQuestion);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion({ ...question });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!selectedQuiz || !editingQuestion) return;
    
    const updatedQuestions = editingQuestion.id.startsWith('q') && 
      selectedQuiz.questions.some(q => q.id === editingQuestion.id)
      ? selectedQuiz.questions.map(q => q.id === editingQuestion.id ? editingQuestion : q)
      : [...selectedQuiz.questions, editingQuestion];
    
    setSelectedQuiz({
      ...selectedQuiz,
      questions: updatedQuestions.sort((a, b) => a.order - b.order),
    });
    
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedQuiz) return;
    
    setSelectedQuiz({
      ...selectedQuiz,
      questions: selectedQuiz.questions.filter(q => q.id !== questionId),
    });
  };

  const handleAddOption = () => {
    if (!editingQuestion) return;
    
    const newOption: QuizOption = {
      id: `opt${Date.now()}`,
      text: '',
      value: '',
    };
    
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, newOption],
    });
  };

  const handleUpdateOption = (optionId: string, field: 'text' | 'value', value: string) => {
    if (!editingQuestion) return;
    
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.map(opt =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      ),
    });
  };

  const handleDeleteOption = (optionId: string) => {
    if (!editingQuestion) return;
    
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.filter(opt => opt.id !== optionId),
    });
  };

  const handleAddRule = () => {
    if (!selectedQuiz) return;
    
    const newRule: RecommendationRule = {
      id: `r${Date.now()}`,
      name: 'Nueva Regla',
      conditions: [{ value: '' }],
      productId: '',
      productName: '',
      priority: 1,
    };
    
    setEditingRule(newRule);
    setIsRuleModalOpen(true);
  };

  const handleEditRule = (rule: RecommendationRule) => {
    setEditingRule({ ...rule });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!selectedQuiz || !editingRule) return;
    
    const product = availableProducts.find(p => p.value === editingRule.productId);
    
    const updatedRule: RecommendationRule = {
      ...editingRule,
      productName: product?.label || editingRule.productId,
    };
    
    // Generar ID temporal si es nuevo
    const ruleId = editingRule.id || `r${Date.now()}`;
    const updatedRuleWithId = { ...updatedRule, id: ruleId };
    
    const updatedRules = selectedQuiz.rules.some(r => r.id === ruleId)
      ? selectedQuiz.rules.map(r => r.id === ruleId ? updatedRuleWithId : r)
      : [...selectedQuiz.rules, updatedRuleWithId];
    
    setSelectedQuiz({
      ...selectedQuiz,
      rules: updatedRules.sort((a, b) => b.priority - a.priority),
    });
    
    setIsRuleModalOpen(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!selectedQuiz) return;
    
    setSelectedQuiz({
      ...selectedQuiz,
      rules: selectedQuiz.rules.filter(r => r.id !== ruleId),
    });
  };

  const handleAddCondition = () => {
    if (!editingRule) return;
    
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, { value: '' }],
    });
  };

  const handleUpdateCondition = (index: number, field: 'value' | 'minCount' | 'maxCount', value: string | number) => {
    if (!editingRule) return;
    
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.map((cond, i) =>
        i === index ? { ...cond, [field]: value } : cond
      ),
    });
  };

  const handleDeleteCondition = (index: number) => {
    if (!editingRule) return;
    
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        <span className="ml-3 text-text-secondary">Cargando quizzes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Quizzes</h1>
          <p className="text-text-secondary mt-2">
            Crea y gestiona quizzes de recomendación de cervezas con sistema de reglas
          </p>
        </div>
        <Button onClick={handleCreateQuiz} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Quiz
        </Button>
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4 text-status-error">
          {error}
        </div>
      )}

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map(quiz => (
          <Card 
            key={quiz.id} 
            className={`cursor-pointer transition-all hover:border-[#ff6b35] ${
              selectedQuiz?.id === quiz.id ? 'border-[#ff6b35]' : ''
            }`}
            onClick={() => setSelectedQuiz(quiz)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">{quiz.name}</CardTitle>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                    {quiz.description || 'Sin descripción'}
                  </p>
                </div>
                <Badge variant={quiz.isActive ? 'success' : 'default'}>
                  {quiz.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Preguntas:</span>
                  <span className="text-white font-medium">{quiz.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Reglas:</span>
                  <span className="text-white font-medium">{quiz.rules.length}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditQuiz(quiz);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:border-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuiz(quiz.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quiz Editor */}
      {selectedQuiz && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedQuiz.name}</CardTitle>
                <p className="text-sm text-text-secondary mt-1">
                  Editor de preguntas y reglas de recomendación
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedQuiz({
                      ...selectedQuiz,
                      isActive: !selectedQuiz.isActive,
                    });
                  }}
                >
                  {selectedQuiz.isActive ? 'Desactivar' : 'Activar'} Quiz
                </Button>
                <Button 
                  onClick={handleSaveQuiz} 
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="questions">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Preguntas ({selectedQuiz.questions.length})
                </TabsTrigger>
                <TabsTrigger value="rules">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Reglas de Recomendación ({selectedQuiz.rules.length})
                </TabsTrigger>
              </TabsList>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-text-secondary">
                    Gestiona las preguntas del quiz y sus opciones de respuesta
                  </p>
                  <Button onClick={handleAddQuestion} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Pregunta
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedQuiz.questions.map((question, index) => (
                    <Card key={question.id} className="bg-[#2C2C2C]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="bg-[#ff6b35]/10 text-[#ff6b35]">
                                Pregunta {index + 1}
                              </Badge>
                              {!question.isActive && (
                                <Badge variant="default" className="bg-gray-500/10 text-gray-500">
                                  Inactiva
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-white text-lg">{question.question}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded-lg"
                            >
                              <span className="text-text-secondary text-sm w-6">
                                {String.fromCharCode(97 + optIndex)}.
                              </span>
                              <span className="text-white flex-1">{option.text}</span>
                              <Badge variant="outline" className="text-xs">
                                {option.value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {selectedQuiz.questions.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay preguntas configuradas</p>
                      <p className="text-sm mt-2">Crea la primera pregunta para comenzar</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Rules Tab */}
              <TabsContent value="rules" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-text-secondary">
                    Configura las reglas que determinan qué cerveza recomendar según las respuestas
                  </p>
                  <Button onClick={handleAddRule} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Regla
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedQuiz.rules.map((rule, index) => (
                    <Card key={rule.id} className="bg-[#2C2C2C]">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="bg-blue-500/10 text-blue-400">
                                Prioridad {rule.priority}
                              </Badge>
                            </div>
                            <CardTitle className="text-white text-lg">{rule.name}</CardTitle>
                            {rule.description && (
                              <p className="text-text-secondary text-sm mt-1">{rule.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-text-secondary mb-2">Condiciones:</p>
                            <div className="space-y-2">
                              {rule.conditions.map((condition, condIndex) => (
                                <div
                                  key={condIndex}
                                  className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded-lg"
                                >
                                  <span className="text-white font-medium">
                                    {condition.value}
                                  </span>
                                  {condition.minCount && (
                                    <span className="text-text-secondary text-sm">
                                      (mín: {condition.minCount})
                                    </span>
                                  )}
                                  {condition.maxCount && (
                                    <span className="text-text-secondary text-sm">
                                      (máx: {condition.maxCount})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-[#ff6b35]" />
                              <span className="text-white font-medium">{rule.productName}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {selectedQuiz.rules.length === 0 && (
                    <div className="text-center py-12 text-text-secondary">
                      <ArrowRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay reglas configuradas</p>
                      <p className="text-sm mt-2">Crea reglas para determinar las recomendaciones</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Question Editor Modal */}
      <Modal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-semibold text-white">
            {editingQuestion?.id && selectedQuiz?.questions.some(q => q.id === editingQuestion.id)
              ? 'Editar Pregunta'
              : 'Nueva Pregunta'}
          </h2>
        </ModalHeader>
        <ModalBody>
          {editingQuestion && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Pregunta <span className="text-red-400">*</span>
                </label>
                <Input
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  placeholder="Ej: ¿Qué tipo de sabor prefieres en una cerveza?"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Orden
                </label>
                <Input
                  type="number"
                  value={editingQuestion.order}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      order: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Opciones de Respuesta
                  </label>
                  <Button variant="outline" size="sm" onClick={handleAddOption} className="gap-2">
                    <Plus className="w-3 h-3" />
                    Agregar Opción
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingQuestion.options.map((option, index) => (
                    <div
                      key={option.id}
                      className="p-4 bg-[#2C2C2C] rounded-lg border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">
                              Texto de la Opción
                            </label>
                            <Input
                              value={option.text}
                              onChange={(e) =>
                                handleUpdateOption(option.id, 'text', e.target.value)
                              }
                              placeholder="Ej: Suave y refrescante"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">
                              Valor (para reglas)
                            </label>
                            <Input
                              value={option.value}
                              onChange={(e) =>
                                handleUpdateOption(option.id, 'value', e.target.value.toLowerCase())
                              }
                              placeholder="Ej: wheat, ipa, porter, ale"
                              className="w-full"
                            />
                            <p className="text-xs text-text-secondary mt-1">
                              Este valor se usa en las reglas de recomendación
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOption(option.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {editingQuestion.options.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm">
                      No hay opciones. Agrega al menos una opción de respuesta.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingQuestion.isActive}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                />
                <label htmlFor="isActive" className="text-sm text-text-secondary">
                  Pregunta activa
                </label>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsQuestionModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveQuestion}
            disabled={!editingQuestion?.question || editingQuestion.options.length === 0}
          >
            Guardar Pregunta
          </Button>
        </ModalFooter>
      </Modal>

      {/* Rule Editor Modal */}
      <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-xl font-semibold text-white">
            {editingRule?.id && selectedQuiz?.rules.some(r => r.id === editingRule.id)
              ? 'Editar Regla'
              : 'Nueva Regla'}
          </h2>
        </ModalHeader>
        <ModalBody>
          {editingRule && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nombre de la Regla <span className="text-red-400">*</span>
                </label>
                <Input
                  value={editingRule.name}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, name: e.target.value })
                  }
                  placeholder="Ej: Recomendación IPA"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descripción
                </label>
                <Input
                  value={editingRule.description || ''}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, description: e.target.value })
                  }
                  placeholder="Descripción de cuándo aplicar esta regla"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Producto Recomendado <span className="text-red-400">*</span>
                </label>
                <Select
                  options={[
                    { value: '', label: 'Seleccionar producto...' },
                    ...availableProducts,
                  ]}
                  value={editingRule.productId}
                  onChange={(value) => {
                    const product = MOCK_PRODUCTS.find(p => p.id === value);
                    setEditingRule({
                      ...editingRule,
                      productId: value,
                      productName: product?.name || '',
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Prioridad
                </label>
                <Input
                  type="number"
                  value={editingRule.priority}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      priority: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Mayor prioridad = se evalúa primero. Si múltiples reglas coinciden, se usa la de mayor prioridad.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Condiciones <span className="text-red-400">*</span>
                  </label>
                  <Button variant="outline" size="sm" onClick={handleAddCondition} className="gap-2">
                    <Plus className="w-3 h-3" />
                    Agregar Condición
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingRule.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#2C2C2C] rounded-lg border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">
                              Valor
                            </label>
                            <Input
                              value={condition.value}
                              onChange={(e) =>
                                handleUpdateCondition(index, 'value', e.target.value.toLowerCase())
                              }
                              placeholder="wheat, ipa, etc."
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">
                              Mín. Respuestas
                            </label>
                            <Input
                              type="number"
                              value={condition.minCount || ''}
                              onChange={(e) =>
                                handleUpdateCondition(
                                  index,
                                  'minCount',
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )
                              }
                              placeholder="Opcional"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">
                              Máx. Respuestas
                            </label>
                            <Input
                              type="number"
                              value={condition.maxCount || ''}
                              onChange={(e) =>
                                handleUpdateCondition(
                                  index,
                                  'maxCount',
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )
                              }
                              placeholder="Opcional"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCondition(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {editingRule.conditions.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm">
                      No hay condiciones. Agrega al menos una condición.
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  La regla se aplica cuando TODAS las condiciones se cumplen. Ejemplo: Si el valor "ipa" aparece al menos 2 veces en las respuestas.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveRule}
            disabled={
              !editingRule?.name ||
              !editingRule?.productId ||
              editingRule.conditions.length === 0 ||
              editingRule.conditions.some(c => !c.value)
            }
          >
            Guardar Regla
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default QuizManager;








