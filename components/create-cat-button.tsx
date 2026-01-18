'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PromptDialog } from './prompt-dialog'
import { Plus } from 'lucide-react'

export function CreateCatButton() {
  const router = useRouter()

  return (
    <PromptDialog
      onSuccess={() => {
        router.refresh()
      }}
    >
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Добавить котика
      </Button>
    </PromptDialog>
  )
}
