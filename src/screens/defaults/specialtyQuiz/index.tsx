import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  getQuizQuestions,
  submitQuizAnswers,
  updateUserSpecialty,
  QuizAnswer,
  QuizResult,
} from '../../../api/quiz/specialtyQuizApi';
import { AuthStackParamList, AuthNavigationProp } from '../../../navigation/types';

type QuizRoute = RouteProp<AuthStackParamList, 'SpecialtyQuiz'>;

type QuizStep = 'loading' | 'questions' | 'submitting' | 'result';

export default function SpecialtyQuizScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const { params } = useRoute<QuizRoute>();
  const { testCode, userId } = params;
  const queryClient = useQueryClient();

  const cachedQuiz = queryClient.getQueryData<{ total: number; questions: any[] }>(['specialty-quiz', testCode]);
  const [step, setStep] = useState<QuizStep>(cachedQuiz ? 'questions' : 'loading');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data: quiz, isError: quizError, isSuccess: quizLoaded } = useQuery({
    queryKey: ['specialty-quiz', testCode],
    queryFn: () => getQuizQuestions(testCode),
  });

  useEffect(() => {
    if (quizLoaded) setStep('questions');
  }, [quizLoaded]);

  useEffect(() => {
    if (quizError) {
      Toast.show({ type: 'error', text1: t('quiz.toastLoadError') });
    }
  }, [quizError]);

  const { mutate: submitAnswers } = useMutation({
    mutationFn: (finalAnswers: QuizAnswer[]) => submitQuizAnswers(testCode, finalAnswers),
    onSuccess: async (quizResult) => {
      try {
        await updateUserSpecialty(userId, quizResult.specialty_id);
      } catch {
        /* falha silenciosa — resultado já foi salvo no backend via submit */
      }
      setResult(quizResult);
      setStep('result');
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: t('quiz.toastSubmitError'),
        text2: error.message,
      });
      setStep('questions');
    },
  });

  const questions = quiz?.questions ?? [];
  const total = quiz?.total ?? 0;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (!selectedOption || !currentQuestion) return;

    const newAnswers = [
      ...answers,
      { question_id: currentQuestion.id, option_id: selectedOption },
    ];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex + 1 < total) {
      setCurrentIndex(i => i + 1);
    } else {
      setStep('submitting');
      submitAnswers(newAnswers);
    }
  };

  /* ── Loading ── */
  if (step === 'loading' || (!quiz && !quizError)) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#8B1A2B" />
        <Text className="text-[13px] text-[#888] mt-4">{t('quiz.loading')}</Text>
      </View>
    );
  }

  /* ── Erro ao carregar ── */
  if (quizError) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-6"
        style={{ paddingTop: insets.top }}>
        <Text className="text-[16px] font-bold text-[#111] text-center">
          {t('quiz.loadError')}
        </Text>
        <View className="h-4" />
        <TouchableOpacity
          className="bg-primary rounded-[10px] py-[14px] px-8"
          onPress={() => navigation.navigate('Login')}>
          <Text className="text-white font-bold">{t('quiz.goToLogin')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ── Enviando respostas ── */
  if (step === 'submitting') {
    return (
      <View
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#8B1A2B" />
        <Text className="text-[13px] text-[#888] mt-4">{t('quiz.calculating')}</Text>
      </View>
    );
  }

  /* ── Resultado ── */
  if (step === 'result' && result) {
    return (
      <View
        className="flex-1 bg-white px-6"
        style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}>
        <Text className="text-[13px] font-semibold text-center text-primary tracking-[3px] uppercase">
          {t('quiz.yourSpecialty')}
        </Text>

        <View className="h-4" />

        <Text
          className="text-[28px] font-extrabold text-center text-[#111]"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {result.specialty_name}
        </Text>

        <View className="h-6" />

        <View className="bg-[#f9f6f6] rounded-[12px] p-5">
          <Text className="text-[14px] text-[#444] leading-[22px] text-center">
            {result.description}
          </Text>
        </View>

        <View className="h-3" />

        <Text className="text-[12px] text-center text-[#999] italic">
          {result.message}
        </Text>

        <View className="flex-1" />

        <TouchableOpacity
          className="bg-primary rounded-[10px] py-[15px] items-center"
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}>
          <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
            {t('quiz.doLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ── Perguntas ── */
  const progress = total > 0 ? (currentIndex + 1) / total : 0;

  return (
    <View
      className="flex-1 bg-white px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>

      {/* Header com progresso */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[12px] text-[#999]">
          {currentIndex + 1} / {total}
        </Text>
        <Text className="text-[12px] text-primary font-semibold">{t('quiz.quizTitle')}</Text>
      </View>

      {/* Barra de progresso */}
      <View className="h-[4px] bg-[#f0eded] rounded-full mb-8">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      {/* Pergunta */}
      <Text
        className="text-[20px] font-extrabold text-[#111] leading-[28px] mb-8"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
        {currentQuestion?.text}
      </Text>

      {/* Opções */}
      <View className="gap-3">
        {currentQuestion?.options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              onPress={() => handleSelectOption(option.id)}
              className={`rounded-[12px] px-4 py-4 border ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-white border-[#e0e0e0]'
              }`}>
              <Text
                className={`text-[14px] font-medium leading-[20px] ${
                  isSelected ? 'text-white' : 'text-[#333]'
                }`}>
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1" />

      {/* Botão avançar */}
      <TouchableOpacity
        className={`rounded-[10px] py-[15px] items-center mt-6 ${
          selectedOption ? 'bg-primary' : 'bg-[#ccc]'
        }`}
        activeOpacity={0.85}
        disabled={!selectedOption}
        onPress={handleNext}>
        <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
          {currentIndex + 1 < total ? t('quiz.next') : t('quiz.finish')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
