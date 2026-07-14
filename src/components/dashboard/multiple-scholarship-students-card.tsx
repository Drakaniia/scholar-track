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
    <div className="rounded-lg border-[0.5px] border-border/60 bg-muted/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{student.studentName}</p>
          <p className="text-xs text-muted-foreground">
            {student.yearLevel} / {student.program || student.gradeLevel}
          </p>
        </div>
        <Badge className="shrink-0 border-chart-4/20 bg-chart-4/10 text-chart-4" variant="outline">
          <AnimatedNumber value={student.scholarshipCount} /> scholarships
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {student.scholarships.map((scholarship, index) => (
          <span
            key={`${student.id}-${scholarship.scholarshipName}-${scholarship.academicYear}-${index}`}
            className="rounded-md border-[0.5px] border-border/60 bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-sm"
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
    <div className="rounded-lg border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
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
      <Card className="border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl shadow-sm">
        <CardHeader className="border-b-[0.5px] border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <CardTitle className="text-lg text-foreground">
                Students With Multiple Scholarships
              </CardTitle>
            </div>
            {hasHiddenStudents ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="w-fit gap-2"
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
        <DialogContent className="p-0 sm:max-w-3xl">
          <DialogHeader className="border-b-[0.5px] border-border/60 bg-muted/40 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Students With Multiple Scholarships
            </DialogTitle>
            <DialogDescription>
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
