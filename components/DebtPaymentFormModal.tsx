
import React from 'react';
import { useState, useEffect, ChangeEvent } from 'react';
import { Debt, DebtPayment, Account } from '../types';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import Textarea from './Textarea';
import { getISODateString } from '../utils/helpers';

interface DebtPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: Omit<DebtPayment, 'id' | 'user_id' | 'profile_id' | 'created_at' | 'updated_at' | 'linked_expense_transaction_id'>, createLinkedExpense: boolean, linkedAccountId?: string) => void;
  debt: Debt;
  accounts: Account[];
}

const DebtPaymentFormModal: React.FC<DebtPaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  debt,
  accounts,
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(getISODateString());
  const [notes, setNotes] = useState('');
  const [createLinkedExpense, setCreateLinkedExpense] = useState(false);
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
      setPaymentDate(getISODateString());
      setNotes('');
      setCreateLinkedExpense(false);
      setLinkedAccountId(accounts.length > 0 ? accounts[0].id : '');
      setErrors({});
    }
  }, [isOpen, accounts]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmountPaid = parseFloat(amountPaid);
    if (isNaN(numAmountPaid) || numAmountPaid <= 0) {
      newErrors.amountPaid = 'Valor pago deve ser positivo.';
    }
    // Nota: Permitimos pagamento maior que o saldo devedor, pois pode haver juros não calculados aqui.
    // Se quiser validar contra debt.current_balance, pode adicionar:
    // else if (numAmountPaid > debt.current_balance) {
    //   newErrors.amountPaid = `Valor excede o saldo devedor de ${formatCurrency(debt.current_balance)}.`;
    // }
    if (!paymentDate) newErrors.paymentDate = 'Data do pagamento é obrigatória.';
    if (createLinkedExpense && !linkedAccountId) newErrors.linkedAccountId = 'Conta de origem da despesa é obrigatória.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const paymentData: Omit<DebtPayment, 'id' | 'user_id' | 'profile_id' | 'created_at' | 'updated_at' | 'linked_expense_transaction_id'> = {
      debt_id: debt.id,
      amount_paid: parseFloat(amountPaid),
      payment_date: paymentDate,
      notes: notes.trim() || undefined,
    };
    onSave(paymentData, createLinkedExpense, linkedAccountId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrar Pagamento: ${debt.name}`}>
      <div className="space-y-4">
        <Input
          label="Valor Pago (R$)"
          id="debtPaymentAmount"
          type="number"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          error={errors.amountPaid}
          required
        />
        <Input
          label="Data do Pagamento"
          id="debtPaymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          error={errors.paymentDate}
          required
        />
        <Textarea
          label="Notas (Opcional)"
          id="debtPaymentNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ex: Pagamento parcial, acordo..."
        />

        {accounts.length > 0 && (
          <div className="pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createLinkedExpense}
                onChange={(e) => setCreateLinkedExpense(e.target.checked)}
                className="rounded text-primary dark:text-primaryDark focus:ring-primary dark:focus:ring-primaryDark bg-surface dark:bg-surfaceDark border-borderBase dark:border-borderBaseDark shadow-sm"
              />
              <span className="text-sm text-textMuted dark:text-textMutedDark">
                Registrar como despesa em uma conta?
              </span>
            </label>
            {createLinkedExpense && (
              <Select
                containerClassName="mt-2"
                label="Conta de Origem da Despesa"
                id="debtPaymentLinkedAccount"
                options={accounts.map(a => ({ value: a.id, label: a.name }))}
                value={linkedAccountId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setLinkedAccountId(e.target.value)}
                error={errors.linkedAccountId}
                placeholder="Selecione uma conta"
              />
            )}
          </div>
        )}

        {errors.form && <p className="mt-1 text-xs text-destructive dark:text-destructiveDark/90">{errors.form}</p>}
        <div className="flex justify-end space-x-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>
            Salvar Pagamento
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DebtPaymentFormModal;
