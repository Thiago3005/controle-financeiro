
import React from 'react';
import { useState, useEffect, ChangeEvent } from 'react';
import { MoneyBox, MoneyBoxTransaction, MoneyBoxTransactionType, Account, TransactionType as MainTransactionType } from '../types';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { getISODateString } from '../utils/helpers'; // generateId removed

interface MoneyBoxTransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<MoneyBoxTransaction, 'id' | 'user_id' | 'profile_id' | 'created_at' | 'updated_at' | 'linked_transaction_id'>, createLinkedTransaction: boolean, linkedAccountId?: string) => void;
  moneyBox: MoneyBox;
  accounts: Account[]; // For linking transactions
  transactionType: MoneyBoxTransactionType; // DEPOSIT or WITHDRAWAL
}

const MoneyBoxTransactionFormModal: React.FC<MoneyBoxTransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  moneyBox,
  accounts,
  transactionType,
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getISODateString());
  const [description, setDescription] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState<string>('');
  const [createLinkedTransaction, setCreateLinkedTransaction] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(getISODateString());
      setDescription('');
      setLinkedAccountId(accounts.length > 0 ? accounts[0].id : '');
      setCreateLinkedTransaction(false);
      setErrors({});
    }
  }, [isOpen, accounts]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valor deve ser positivo.';
    if (!date) newErrors.date = 'Data é obrigatória.';
    if (createLinkedTransaction && !linkedAccountId) newErrors.linkedAccountId = 'Conta para vínculo é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const transactionData: Omit<MoneyBoxTransaction, 'id' | 'user_id' | 'profile_id' | 'created_at' | 'updated_at' | 'linked_transaction_id'> = {
      // id, user_id, profile_id, created_at, updated_at, linked_transaction_id are handled by Supabase/App.tsx
      money_box_id: moneyBox.id,
      type: transactionType,
      amount: parseFloat(amount),
      date,
      description: description.trim() || undefined,
    };
    onSave(transactionData, createLinkedTransaction, linkedAccountId);
    onClose();
  };

  const modalTitle = transactionType === MoneyBoxTransactionType.DEPOSIT ? 'Depositar na Caixinha' : 'Sacar da Caixinha';
  const linkedTransactionLabel = transactionType === MoneyBoxTransactionType.DEPOSIT 
    ? 'Registrar como despesa na conta:' 
    : 'Registrar como receita na conta:';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${modalTitle}: ${moneyBox.name}`}>
      <div className="space-y-4">
        <Input
          label="Valor"
          id="mbAmount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          required
        />
        <Input
          label="Data"
          id="mbDate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <Input
          label="Descrição (Opcional)"
          id="mbDescription"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {accounts.length > 0 && (
          <div className="pt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={createLinkedTransaction}
                onChange={(e) => setCreateLinkedTransaction(e.target.checked)}
                className="rounded text-primary dark:text-primaryDark focus:ring-primary dark:focus:ring-primaryDark bg-surface dark:bg-surfaceDark border-borderBase dark:border-borderBaseDark"
              />
              <span className="text-sm text-textMuted dark:text-textMutedDark">
                {transactionType === MoneyBoxTransactionType.DEPOSIT 
                  ? 'Vincular a uma despesa de conta?'
                  : 'Vincular a uma receita em conta?'}
              </span>
            </label>
            {createLinkedTransaction && (
              <Select
                containerClassName="mt-2"
                label={linkedTransactionLabel}
                id="mbLinkedAccount"
                options={accounts.map(a => ({ value: a.id, label: a.name }))}
                value={linkedAccountId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setLinkedAccountId(e.target.value)}
                error={errors.linkedAccountId}
                placeholder="Selecione uma conta"
              />
            )}
          </div>
        )}

        {errors.form && <p className="text-sm text-destructive dark:text-destructiveDark/90">{errors.form}</p>}
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>
            {transactionType === MoneyBoxTransactionType.DEPOSIT ? 'Depositar' : 'Sacar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MoneyBoxTransactionFormModal;