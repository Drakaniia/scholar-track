'use client';

import { useRef, useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { StudentForm, type StudentFormHandle } from '@/components/forms/student-form';
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from '@/components/shared/dialog-layout';
import { Button } from '@/components/ui/button';
import type { CreateStudentInput } from '@/types';

type StudentBatchEntry = {
  readonly id: string;
};

type StudentBatchFormProps = {
  readonly onSubmit: (students: CreateStudentInput[]) => Promise<void>;
  readonly onCancel: () => void;
  readonly loading?: boolean;
  readonly canEditFees?: boolean;
  readonly canManageAcademicYears?: boolean;
};

function createEntry(index: number): StudentBatchEntry {
  return { id: `student-entry-${index}` };
}

export function StudentBatchForm({
  onSubmit,
  onCancel,
  loading = false,
  canEditFees = true,
  canManageAcademicYears = false,
}: StudentBatchFormProps) {
  const nextEntryIndexRef = useRef(2);
  const formRefs = useRef<Record<string, StudentFormHandle | null>>({});
  const [entries, setEntries] = useState<StudentBatchEntry[]>(() => [createEntry(1)]);

  const addEntry = () => {
    const nextEntry = createEntry(nextEntryIndexRef.current);
    nextEntryIndexRef.current += 1;
    setEntries((current) => [...current, nextEntry]);
  };

  const removeEntry = (entryId: string) => {
    delete formRefs.current[entryId];
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
  };

  const submitStudents = async () => {
    const students: CreateStudentInput[] = [];
    let studentIndex = 0;

    for (const entry of entries) {
      const formRef = formRefs.current[entry.id];
      const result = await formRef?.getSubmissionData();

      if (!result) {
        toast.error(`Student ${studentIndex + 1}: Form is not ready yet.`);
        return;
      }

      if (!result.success) {
        toast.error(`Student ${studentIndex + 1}: ${result.message}`);
        return;
      }

      students.push(result.data);
      studentIndex += 1;
    }

    await onSubmit(students);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`${DIALOG_BODY_CLASS} flex flex-col gap-5`}>
        {entries.map((entry, index) => (
          <section key={entry.id} className="rounded-lg border bg-background p-4">
            <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
              <h3 className="text-base font-semibold">Student {index + 1}</h3>
              {entries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Remove Student ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <StudentForm
              ref={(instance) => {
                formRefs.current[entry.id] = instance;
              }}
              onSubmit={() => undefined}
              onCancel={onCancel}
              hideFooter
              embedded
              canEditFees={canEditFees}
              canManageAcademicYears={canManageAcademicYears}
              idPrefix={entry.id}
            />
          </section>
        ))}
      </div>
      <div className={`${DIALOG_FOOTER_CLASS} flex flex-wrap items-center justify-between gap-3`}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={addEntry} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Add More Student
          </Button>
          <Button type="button" variant="gradient" onClick={submitStudents} disabled={loading}>
            {loading ? 'Saving...' : 'Add Students'}
          </Button>
        </div>
      </div>
    </div>
  );
}
