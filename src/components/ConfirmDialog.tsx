import React from 'react'
import { Modal } from './Modal'
import { t } from '../i18n'

interface ConfirmDialogProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('lbl_confirm')} maxWidth="420px">
      <p style={{ marginBottom: '1.5rem' }}>{message}</p>
      <div className="form-actions">
        <button
          className={danger ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={onConfirm}
        >
          {confirmLabel ?? t('lbl_confirm')}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          {cancelLabel ?? t('lbl_cancel')}
        </button>
      </div>
    </Modal>
  )
}
