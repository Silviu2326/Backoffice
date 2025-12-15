import { supabase } from '../../../lib/supabase';

/**
 * Tipos para las estructuras de Supabase
 */
export interface SupabaseQuiz {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseQuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseQuizOption {
  id: string;
  question_id: string;
  text: string;
  value: string;
  points?: number;
  order: number;
  created_at: string;
}

export interface SupabaseQuizRule {
  id: string;
  quiz_id: string;
  name: string;
  conditions: {
    value: string;
    min_count?: number;
    max_count?: number;
  }[];
  product_id: string;
  priority: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos para la aplicación
 */
export interface QuizOption {
  id: string;
  text: string;
  value: string;
  points?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  order: number;
  options: QuizOption[];
  isActive: boolean;
}

export interface RecommendationRule {
  id: string;
  name: string;
  conditions: {
    value: string;
    minCount?: number;
    maxCount?: number;
  }[];
  productId: string;
  productName: string;
  priority: number;
  description?: string;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  questions: QuizQuestion[];
  rules: RecommendationRule[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Convierte un quiz de Supabase al tipo de la aplicación
 */
async function mapSupabaseToQuiz(supabaseQuiz: SupabaseQuiz): Promise<Quiz> {
  // Obtener preguntas
  const { data: questionsData, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', supabaseQuiz.id)
    .order('order', { ascending: true });

  if (questionsError) {
    console.error('Error fetching quiz questions:', questionsError);
    throw questionsError;
  }

  // Obtener opciones para cada pregunta
  const questionIds = (questionsData || []).map(q => q.id);
  let optionsMap: Record<string, SupabaseQuizOption[]> = {};

  if (questionIds.length > 0) {
    const { data: optionsData, error: optionsError } = await supabase
      .from('quiz_options')
      .select('*')
      .in('question_id', questionIds)
      .order('order', { ascending: true });

    if (optionsError) {
      console.error('Error fetching quiz options:', optionsError);
      throw optionsError;
    }

    optionsMap = (optionsData || []).reduce((acc, opt) => {
      if (!acc[opt.question_id]) {
        acc[opt.question_id] = [];
      }
      acc[opt.question_id].push(opt);
      return acc;
    }, {} as Record<string, SupabaseQuizOption[]>);
  }

  // Mapear preguntas con sus opciones
  const questions: QuizQuestion[] = (questionsData || []).map(q => ({
    id: q.id,
    question: q.question,
    order: q.order,
    isActive: q.is_active,
    options: (optionsMap[q.id] || []).map(opt => ({
      id: opt.id,
      text: opt.text,
      value: opt.value,
      points: opt.points,
    })),
  }));

  // Obtener reglas
  const { data: rulesData, error: rulesError } = await supabase
    .from('quiz_rules')
    .select('*')
    .eq('quiz_id', supabaseQuiz.id)
    .order('priority', { ascending: false });

  if (rulesError) {
    console.error('Error fetching quiz rules:', rulesError);
    throw rulesError;
  }

  // Obtener nombres de productos para las reglas
  const productIds = (rulesData || []).map(r => r.product_id);
  let productsMap: Record<string, string> = {};

  if (productIds.length > 0) {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    if (!productsError && productsData) {
      productsMap = productsData.reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
      }, {} as Record<string, string>);
    }
  }

  // Mapear reglas
  const rules: RecommendationRule[] = (rulesData || []).map(r => ({
    id: r.id,
    name: r.name,
    conditions: r.conditions,
    productId: r.product_id,
    productName: productsMap[r.product_id] || r.product_id,
    priority: r.priority,
    description: r.description,
  }));

  return {
    id: supabaseQuiz.id,
    name: supabaseQuiz.name,
    description: supabaseQuiz.description,
    isActive: supabaseQuiz.is_active,
    questions,
    rules,
    createdAt: supabaseQuiz.created_at,
    updatedAt: supabaseQuiz.updated_at,
  };
}

/**
 * Obtiene todos los quizzes
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    const { data: quizzesData, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      throw quizzesError;
    }

    if (!quizzesData || quizzesData.length === 0) {
      return [];
    }

    // Mapear cada quiz con sus preguntas, opciones y reglas
    return await Promise.all(quizzesData.map(mapSupabaseToQuiz));
  } catch (error) {
    console.error('Error in getAllQuizzes:', error);
    throw error;
  }
}

/**
 * Obtiene un quiz por ID
 */
export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (quizError) {
      if (quizError.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching quiz:', quizError);
      throw quizError;
    }

    if (!quizData) {
      return null;
    }

    return mapSupabaseToQuiz(quizData);
  } catch (error) {
    console.error('Error in getQuizById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo quiz
 */
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
  try {
    // Crear el quiz principal
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        name: quiz.name,
        description: quiz.description,
        is_active: quiz.isActive,
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
      throw quizError;
    }

    const quizId = quizData.id;

    // Crear preguntas y opciones
    for (const question of quiz.questions) {
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizId,
          question: question.question,
          order: question.order,
          is_active: question.isActive,
        })
        .select()
        .single();

      if (questionError) {
        console.error('Error creating quiz question:', questionError);
        throw questionError;
      }

      // Crear opciones
      if (question.options.length > 0) {
        const optionsToInsert = question.options.map((opt, index) => ({
          question_id: questionData.id,
          text: opt.text,
          value: opt.value,
          points: opt.points,
          order: index + 1,
        }));

        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error('Error creating quiz options:', optionsError);
          throw optionsError;
        }
      }
    }

    // Crear reglas
    if (quiz.rules.length > 0) {
      const rulesToInsert = quiz.rules.map(rule => ({
        quiz_id: quizId,
        name: rule.name,
        conditions: rule.conditions,
        product_id: rule.productId,
        priority: rule.priority,
        description: rule.description,
      }));

      const { error: rulesError } = await supabase
        .from('quiz_rules')
        .insert(rulesToInsert);

      if (rulesError) {
        console.error('Error creating quiz rules:', rulesError);
        throw rulesError;
      }
    }

    // Obtener el quiz completo
    return await getQuizById(quizId) || {} as Quiz;
  } catch (error) {
    console.error('Error in createQuiz:', error);
    throw error;
  }
}

/**
 * Actualiza un quiz existente
 */
export async function updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
  try {
    // Actualizar el quiz principal
    const updateData: Partial<SupabaseQuiz> = {};
    if (quiz.name !== undefined) updateData.name = quiz.name;
    if (quiz.description !== undefined) updateData.description = quiz.description;
    if (quiz.isActive !== undefined) updateData.is_active = quiz.isActive;

    if (Object.keys(updateData).length > 0) {
      const { error: quizError } = await supabase
        .from('quizzes')
        .update(updateData)
        .eq('id', id);

      if (quizError) {
        console.error('Error updating quiz:', quizError);
        throw quizError;
      }
    }

    // Si se actualizan preguntas, reemplazar todas
    if (quiz.questions !== undefined) {
      // Eliminar preguntas existentes (esto eliminará también las opciones por CASCADE si está configurado)
      const { error: deleteQuestionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', id);

      if (deleteQuestionsError) {
        console.error('Error deleting quiz questions:', deleteQuestionsError);
        throw deleteQuestionsError;
      }

      // Crear nuevas preguntas
      for (const question of quiz.questions) {
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: id,
            question: question.question,
            order: question.order,
            is_active: question.isActive,
          })
          .select()
          .single();

        if (questionError) {
          console.error('Error creating quiz question:', questionError);
          throw questionError;
        }

        // Crear opciones
        if (question.options.length > 0) {
          const optionsToInsert = question.options.map((opt, index) => ({
            question_id: questionData.id,
            text: opt.text,
            value: opt.value,
            points: opt.points,
            order: index + 1,
          }));

          const { error: optionsError } = await supabase
            .from('quiz_options')
            .insert(optionsToInsert);

          if (optionsError) {
            console.error('Error creating quiz options:', optionsError);
            throw optionsError;
          }
        }
      }
    }

    // Si se actualizan reglas, reemplazar todas
    if (quiz.rules !== undefined) {
      // Eliminar reglas existentes
      const { error: deleteRulesError } = await supabase
        .from('quiz_rules')
        .delete()
        .eq('quiz_id', id);

      if (deleteRulesError) {
        console.error('Error deleting quiz rules:', deleteRulesError);
        throw deleteRulesError;
      }

      // Crear nuevas reglas
      if (quiz.rules.length > 0) {
        const rulesToInsert = quiz.rules.map(rule => ({
          quiz_id: id,
          name: rule.name,
          conditions: rule.conditions,
          product_id: rule.productId,
          priority: rule.priority,
          description: rule.description,
        }));

        const { error: rulesError } = await supabase
          .from('quiz_rules')
          .insert(rulesToInsert);

        if (rulesError) {
          console.error('Error creating quiz rules:', rulesError);
          throw rulesError;
        }
      }
    }

    // Obtener el quiz actualizado
    return await getQuizById(id) || {} as Quiz;
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    throw error;
  }
}

/**
 * Elimina un quiz
 */
export async function deleteQuiz(id: string): Promise<void> {
  try {
    // Las preguntas, opciones y reglas se eliminarán automáticamente por CASCADE
    // si está configurado en la base de datos
    const { error: quizError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (quizError) {
      console.error('Error deleting quiz:', quizError);
      throw quizError;
    }
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    throw error;
  }
}




















