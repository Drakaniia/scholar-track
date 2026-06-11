'use client';

import { useState } from 'react';

import { BadgeCheck, List } from 'lucide-react';

import { AnimatedNumber } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ScholarshipFlowData } from '@/hooks/use-queries';

const MULTI_SCHOLARSHIP_PREVIEW_LIMIT = 4;

type MultiScholarshipStudent = ScholarshipFlowData['multiScholarshipStudents'][number];

type MultipleScholarshipStudentsCardProps = {
  readonly students: readonly MultiScholarshipStudent[];
};

type MultiScholarshipStudentItemProps = {
  readonly student: MultiScholarshipStudent;
};

function MultiScholarshipStudentItem({ student }: MultiScholarshipStudentItemProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{student.studentName}</p>
          <p className="text-xs text-slate-500">
            {student.yearLevel} / {student.program || student.gradeLevel}
          </p>
        </div>
        <Badge className="shrink-0 bg-amber-100 text-amber-900" variant="outline">
          <AnimatedNumber value={student.scholarshipCount} /> scholarships
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {student.scholarships.map((scholarship, index) => (
          <span
            key={`${student.id}-${scholarship.scholarshipName}-${scholarship.academicYear}-${index}`}
            className="rounded-md border border-white bg-white px-2 py-1 text-xs text-slate-700 shadow-sm"
          >
            {index + 1}. {scholarship.scholarshipName}
            {scholarship.academicYear ? ` / ${scholarship.academicYear}` : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyMultiScholarshipStudents() {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
      No students with multiple scholarships in the selected source and window.
    </div>
  );
}

export function MultipleScholarshipStudentsCard({
  students,
}: MultipleScholarshipStudentsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const previewStudents = students.slice(0, MULTI_SCHOLARSHIP_PREVIEW_LIMIT);
  const hasStudents = students.length > 0;
  const hasHiddenStudents = students.length > MULTI_SCHOLARSHIP_PREVIEW_LIMIT;

  return (
    <>
      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <CardTitle className="text-lg text-slate-950">
                Students With Multiple Scholarships
              </CardTitle>
            </div>
            {hasHiddenStudents ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="w-fit gap-2 border-slate-300 bg-white"
              >
                <List className="h-4 w-4" />
                View all
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {!hasStudents ? (
            <EmptyMultiScholarshipStudents />
          ) : (
            <div className="space-y-3">
              {previewStudents.map((student) => (
                <MultiScholarshipStudentItem key={student.id} student={student} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-sky-200 p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-sky-100 bg-sky-50 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-slate-950">
              <BadgeCheck className="h-5 w-5 text-sky-700" />
              Students With Multiple Scholarships
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Full list for the selected source and comparative data window.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
            {!hasStudents ? (
              <EmptyMultiScholarshipStudents />
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <MultiScholarshipStudentItem key={student.id} student={student} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
