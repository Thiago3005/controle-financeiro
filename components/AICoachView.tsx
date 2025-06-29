
import React from 'react';
import { useState, ChangeEvent } from 'react'; // Removed unused ChangeEvent if simulation form is gone
import { AIConfig, AIInsight, AIInsightType } from '../types';
import Button from './Button';
import Input from './Input';
// Select and TRANSACTION_TYPE_OPTIONS removed as simulation form is gone
import { formatDate, formatCurrency } from '../utils/helpers';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon'; 
import ArrowPathIcon from './icons/ArrowPathIcon'; 
import SparklesIcon from './icons/SparklesIcon'; 
import CalendarClockIcon from './icons/CalendarClockIcon';
import TrashIcon from './icons/TrashIcon'; // For clear history button


interface AICoachViewProps {
  aiConfig: AIConfig;
  setAiConfig: (configUpdater: Partial<Omit<AIConfig, 'apiKeyStatus'>>) => void;
  insights: AIInsight[];
  onUpdateInsight: (insight: AIInsight) => void; 
  isPrivacyModeEnabled?: boolean;
  onDeleteAllInsights: () => void; 
}

const AICoachView: React.FC<AICoachViewProps> = ({
  aiConfig,
  setAiConfig,
  insights,
  onUpdateInsight,
  isPrivacyModeEnabled,
  onDeleteAllInsights, 
}) => {
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<string>(aiConfig.monthlyIncome?.toString() || '');
  const [incomeEditMode, setIncomeEditMode] = useState(false);

  const handleToggleAICoach = () => {
    setAiConfig({ isEnabled: !aiConfig.isEnabled });
  };

  const handleSaveMonthlyIncome = () => {
    const income = parseFloat(monthlyIncomeInput);
    if (!isNaN(income) && income > 0) {
      setAiConfig({ monthlyIncome: income });
      setIncomeEditMode(false);
    } else if (monthlyIncomeInput === '') {
      setAiConfig({ monthlyIncome: null });
      setIncomeEditMode(false);
    } else {
      alert("Por favor, insira um valor de renda válido ou deixe em branco.");
    }
  };

  React.useEffect(() => {
    setMonthlyIncomeInput(aiConfig.monthlyIncome?.toString() || '');
  }, [aiConfig.monthlyIncome]);


  const sortedInsights = [...insights].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const renderInsightContent = (insight: AIInsight) => {
    return <p className="text-textBase dark:text-textBaseDark whitespace-pre-wrap">{insight.content}</p>;
  };

  const getInsightDisplayInfo = (type: AIInsightType): { icon: JSX.Element; borderColorClass: string; bgColorClass: string } => {
    switch(type) {
      case 'budget_recommendation':
      case 'saving_opportunity_suggestion':
        return { 
            icon: <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />,
            borderColorClass: 'border-yellow-500 dark:border-yellow-400',
            bgColorClass: 'bg-yellow-400/10 dark:bg-yellow-400/15'
        };
      case 'recurring_payment_candidate':
        return {
            icon: <ArrowPathIcon className="w-5 h-5 mr-2 text-teal-500 dark:text-teal-400 flex-shrink-0" />,
            borderColorClass: 'border-teal-500 dark:border-teal-400',
            bgColorClass: 'bg-teal-500/10 dark:bg-teal-400/15'
        };
      case 'cash_flow_projection':
      case 'future_purchase_advice': // Can use same as cash flow for general advice-like
      case 'best_purchase_day_advice':
        return {
            icon: <CalendarClockIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />,
            borderColorClass: 'border-indigo-500 dark:border-indigo-400',
            bgColorClass: 'bg-indigo-500/10 dark:bg-indigo-400/15'
        };
      case 'spending_anomaly_category':
      case 'budget_overspend_projection':
      case 'unusual_transaction_value':
      case 'budget_warning': 
      case 'debt_strategy_explanation':
      case 'debt_projection_summary':
        return {
            icon: <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-500 flex-shrink-0" />,
            borderColorClass: 'border-amber-600 dark:border-amber-500',
            bgColorClass: 'bg-amber-600/10 dark:bg-amber-500/15'
        };
      case 'error_message':
        return {
            icon: <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-destructive dark:text-destructiveDark flex-shrink-0" />,
            borderColorClass: 'border-destructive dark:border-destructiveDark',
            bgColorClass: 'bg-destructive/10 dark:bg-destructiveDark/15'
        };
      default: // general_advice, transaction_comment, goal_update etc.
        return {
            icon: <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-primary dark:text-primaryDark flex-shrink-0" />,
            borderColorClass: 'border-primary dark:border-primaryDark',
            bgColorClass: 'bg-primary/5 dark:bg-primaryDark/10'
        };
    }
  }
  
  const handleMarkAsRead = (insight: AIInsight) => {
    if (!insight.is_read) {
        onUpdateInsight({...insight, is_read: true});
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary dark:text-primaryDark" />
            <h1 className="text-2xl font-bold text-textBase dark:text-textBaseDark">AI Coach Financeiro</h1>
        </div>
        {aiConfig.apiKeyStatus !== 'unavailable' && (
            <label className="flex items-center space-x-2 cursor-pointer">
            <span className="text-sm font-medium text-textMuted dark:text-textMutedDark">
                {aiConfig.isEnabled ? 'Coach Ativado' : 'Coach Desativado'}
            </span>
            <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${aiConfig.isEnabled ? 'bg-primary dark:bg-primaryDark' : 'bg-neutral/30 dark:bg-neutralDark/40'}`}>
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${aiConfig.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
                <input
                type="checkbox"
                className="absolute opacity-0 w-0 h-0"
                checked={aiConfig.isEnabled}
                onChange={handleToggleAICoach}
                />
            </div>
            </label>
        )}
      </div>

      {aiConfig.apiKeyStatus === 'unavailable' && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">API Key Indisponível! </strong>
          <span className="block sm:inline">A funcionalidade do AI Coach está desativada. A chave da API Gemini (process.env.GEMINI_API_KEY) não foi configurada no ambiente. Sem ela, o AI Coach não pode operar.</span>
        </div>
      )}

      {aiConfig.apiKeyStatus === 'error' && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Erro na API! </strong>
          <span className="block sm:inline">Ocorreu um erro ao tentar inicializar ou usar a API Gemini. Verifique o console para mais detalhes.</span>
        </div>
      )}

      {aiConfig.apiKeyStatus === 'available' && (
        <div className="bg-surface dark:bg-surfaceDark p-4 sm:p-6 rounded-xl shadow-lg dark:shadow-neutralDark/30">
          <h2 className="text-xl font-semibold text-textBase dark:text-textBaseDark mb-3">Renda Mensal (para Sugestões)</h2>
          {aiConfig.monthlyIncome && !incomeEditMode ? (
            <div className="flex items-center justify-between">
              <p className="text-textBase dark:text-textBaseDark">
                Sua renda mensal salva:
                <span className="font-bold text-lg text-primary dark:text-primaryDark ml-2">
                  {formatCurrency(aiConfig.monthlyIncome, 'BRL', 'pt-BR', isPrivacyModeEnabled)}
                </span>
              </p>
              <Button variant="ghost" size="sm" onClick={() => setIncomeEditMode(true)}>Editar Renda</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="Informe sua renda mensal estimada"
                id="monthlyIncome"
                type="number"
                placeholder={isPrivacyModeEnabled ? formatCurrency(0, 'BRL', 'pt-BR', true).replace('0,00', 'Ex: 3500.00') : "Ex: 3500.00"}
                value={monthlyIncomeInput}
                onChange={(e) => setMonthlyIncomeInput(e.target.value)}
                containerClassName="max-w-xs"
              />
              <div className="flex space-x-2">
                <Button variant="primary" size="sm" onClick={handleSaveMonthlyIncome}>Salvar Renda</Button>
                {aiConfig.monthlyIncome && <Button variant="ghost" size="sm" onClick={() => setIncomeEditMode(false)}>Cancelar</Button>}
              </div>
              <p className="text-xs text-textMuted dark:text-textMutedDark">Esta informação ajuda o AI Coach a fornecer sugestões de orçamento mais personalizadas.</p>
            </div>
          )}
        </div>
      )}

      {aiConfig.isEnabled && aiConfig.apiKeyStatus === 'available' && (
        <>
          <div className="bg-surface dark:bg-surfaceDark p-4 sm:p-6 rounded-xl shadow-lg dark:shadow-neutralDark/30">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <h2 className="text-xl font-semibold text-textBase dark:text-textBaseDark">Histórico de Insights</h2>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={onDeleteAllInsights} variant="danger" size="sm">
                        <TrashIcon className="w-4 h-4 mr-1.5" /> Limpar Histórico
                    </Button>
                </div>
            </div>
            
            {sortedInsights.length === 0 ? (
              <p className="text-center text-textMuted dark:text-textMutedDark py-8 mt-4">
                Nenhum conselho ou comentário do AI Coach ainda. Interaja com o app ou peça uma nova análise!
              </p>
            ) : (
              <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
                {sortedInsights.map(insight => {
                  const displayInfo = getInsightDisplayInfo(insight.type);
                  return (
                    <li
                        key={insight.id}
                        className={`p-4 rounded-lg shadow-sm border-l-4
                                    ${displayInfo.borderColorClass} ${displayInfo.bgColorClass}
                                    ${insight.isLoading ? 'opacity-60 animate-pulse' : ''}
                                    ${!insight.is_read && !insight.isLoading ? 'cursor-pointer hover:shadow-md' : ''}`}
                        onClick={() => handleMarkAsRead(insight)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMarkAsRead(insight);}}
                        tabIndex={!insight.is_read && !insight.isLoading ? 0 : undefined}
                        role={!insight.is_read && !insight.isLoading ? "button" : undefined}
                        aria-label={!insight.is_read && !insight.isLoading ? "Marcar como lido" : undefined}
                    >
                        <div className="flex items-start">
                        {displayInfo.icon}
                        <div className="flex-1">
                            {renderInsightContent(insight)}
                            <p className="text-xs text-textMuted dark:text-textMutedDark mt-1.5">
                            {formatDate(insight.timestamp, 'pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            {insight.related_transaction_id && <span className="ml-2"> (Ref. Transação)</span>}
                            {insight.related_category_id && insight.type === 'budget_recommendation' && <span className="ml-2"> (Ref. Categoria)</span>}
                            {insight.related_category_id && (insight.type === 'spending_anomaly_category' || insight.type === 'budget_overspend_projection' || insight.type === 'unusual_transaction_value') && <span className="ml-2"> (Ref. Categoria)</span>}
                            {!insight.is_read && !insight.isLoading && <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">Novo</span>}
                            </p>
                        </div>
                        </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {!aiConfig.isEnabled && aiConfig.apiKeyStatus === 'available' && (
         <div className="bg-yellow-100 dark:bg-yellow-700/20 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg" role="alert">
          <p>O AI Coach está atualmente desativado. Ative-o acima para receber dicas e comentários personalizados.</p>
        </div>
      )}

    </div>
  );
};

export default AICoachView;
