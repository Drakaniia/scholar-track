'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';

import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAcademicYearPromotionStatus } from '@/lib/academic-year-promotion-reminder';
import { markActiveAcademicYear, upsertAcademicYear } from '@/lib/academic-year-ui-updates';
import {
  getPromotionDecisionOptions,
  isStudentTransitionDecision,
} from '@/lib/promotion-decisions';
import { STUDENT_TRANSITION_DECISION_LABELS, SCHOLARSHIP_TERMS, SCHOLARSHIP_TERM_LABELS } from '@/types';
import type { StudentTransitionDecision } from '@/types';

import type {
  AcademicYear,
  AcademicYearFormData,
  PromotionPreview,
  PromotionRun,
} from '../settings-types';
import {
  formatDate,
  formatDateForInput,
  getDefaultAcademicYearFormData,
  getPromotionRunBadge,
  getPromotionRunProcessedCount,
} from '../settings-types';
import { AcademicYearSettingsSkeleton } from './settings-table-skeleton';

export function AcademicYearManager() {
  const queryClient = useQueryClient();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [academicYearTotal, setAcademicYearTotal] = useState(0);
  const [academicYearTotalPages, setAcademicYearTotalPages] = useState(0);
  const [academicYearPage] = useState(1);
  const [isSubmittingAcademicYear, setIsSubmittingAcademicYear] = useState(false);
  const [isUndoingPromotion, setIsUndoingPromotion] = useState(false);
  const [isSavingTransitionDecisions, setIsSavingTransitionDecisions] = useState(false);
  const [transitionDecisions, setTransitionDecisions] = useState<
    Record<number, StudentTransitionDecision>
  >({});
  const [promotionPreview, setPromotionPreview] = useState<PromotionPreview | null>(null);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [promotionRun, setPromotionRun] = useState<PromotionRun | null>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState<AcademicYear | null>(null);
  const [activeAcademicYearId, setActiveAcademicYearId] = useState<number | null>(null);
  const [academicYearFormData, setAcademicYearFormData] = useState<AcademicYearFormData>(() =>
    getDefaultAcademicYearFormData()
  );
  const announcedPromotionRunsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    fetchAcademicYears(1);
    fetchPromotionRunStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPromotionRunActive = useCallback(
    (run: PromotionRun | null) => run?.status === 'PENDING' || run?.status === 'PROCESSING',
    []
  );

  const getPromotionStatus = (academicYear: AcademicYear) => {
    const latestRunForYear = promotionRun?.academicYearId === academicYear.id ? promotionRun : null;
    if (latestRunForYear && isPromotionRunActive(latestRunForYear)) {
      return { label: 'Processing', className: 'bg-blue-600 text-white' };
    }
    if (academicYear.promotionProcessedAt) {
      return { label: 'Completed', className: 'bg-green-600 text-white' };
    }
    const status = getAcademicYearPromotionStatus(academicYear);
    if (status === 'completed') {
      return { label: 'Completed', className: 'bg-green-600 text-white' };
    }
    const statusMeta: Record<
      Exclude<typeof status, 'completed'>,
      { label: string; className: string }
    > = {
      disabled: { label: 'Disabled', className: '' },
      due: { label: 'Due', className: 'bg-amber-500 text-white' },
      pending: { label: 'Pending', className: 'bg-blue-600 text-white' },
    };
    return statusMeta[status];
  };

  const syncAcademicYearSettingsForm = useCallback(
    (defaultAcademicYear: AcademicYear | null, years: AcademicYear[] = []) => {
      const fallbackFormData = getDefaultAcademicYearFormData();
      const existingDefaultAcademicYear =
        defaultAcademicYear ||
        years.find((academicYear) => academicYear.year === fallbackFormData.year) ||
        null;

      setActiveAcademicYear(defaultAcademicYear);
      setActiveAcademicYearId(existingDefaultAcademicYear?.id || null);
      setAcademicYearFormData(
        existingDefaultAcademicYear
          ? {
              year: existingDefaultAcademicYear.year,
              startDate: formatDateForInput(existingDefaultAcademicYear.startDate),
              endDate: formatDateForInput(existingDefaultAcademicYear.endDate),
              semester: existingDefaultAcademicYear.semester || '1ST',
              promotionDate: formatDateForInput(existingDefaultAcademicYear.promotionDate),
              isActive: existingDefaultAcademicYear.isActive,
            }
          : fallbackFormData
      );
    },
    []
  );

  const handleIncomingPromotionRun = useCallback((run: PromotionRun | null, announce = false) => {
    setPromotionRun(run);
    if (!run || !announce || (run.status !== 'COMPLETED' && run.status !== 'FAILED')) return;
    if (announcedPromotionRunsRef.current.has(run.id)) return;
    announcedPromotionRunsRef.current.add(run.id);
    if (run.status === 'COMPLETED') {
      toast.success(
        `Promotion complete: ${run.promotedCount} promoted, ${run.graduatedCount} graduated`
      );
    } else {
      toast.error(run.errorMessage || 'Promotion failed. Please review the status in Settings.');
    }
  }, []);

  const fetchAcademicYears = useCallback(
    async (page: number) => {
      setLoadingAcademicYears(true);
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: '10' });
        const [listRes, activeRes] = await Promise.all([
          fetch(`/api/academic-years?${params}`, { credentials: 'include' }),
          fetch('/api/academic-years?action=active', { credentials: 'include' }),
        ]);
        const [listResult, activeResult] = await Promise.all([listRes.json(), activeRes.json()]);

        if (listResult.success) {
          const years = listResult.data || [];
          setAcademicYears(years);
          syncAcademicYearSettingsForm(activeResult.success ? activeResult.data : null, years);
          setAcademicYearTotal(listResult.total);
          setAcademicYearTotalPages(listResult.totalPages);
        } else {
          toast.error(listResult.error || 'Failed to fetch academic years');
        }
        if (!activeResult.success) {
          toast.error(activeResult.error || 'Failed to fetch active academic year');
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
        toast.error('Failed to fetch academic years');
      } finally {
        setLoadingAcademicYears(false);
      }
    },
    [syncAcademicYearSettingsForm]
  );

  const fetchPromotionPreview = useCallback(async () => {
    try {
      const res = await fetch('/api/academic-years/auto-promote', { credentials: 'include' });
      const result = await res.json();
      if (result.success) {
        setPromotionPreview(result.data);
        const initialDecisions: Record<number, StudentTransitionDecision> = {};
        result.data.preview.forEach(
          (student: { id: number; transitionDecision: StudentTransitionDecision | null }) => {
            if (isStudentTransitionDecision(student.transitionDecision)) {
              initialDecisions[student.id] = student.transitionDecision;
            }
          }
        );
        setTransitionDecisions(initialDecisions);
        handleIncomingPromotionRun(result.data.latestRun || null);
      } else {
        toast.error(result.error || 'Failed to fetch promotion preview');
      }
    } catch (error) {
      console.error('Error fetching promotion preview:', error);
      toast.error('Failed to fetch promotion preview');
    }
  }, [handleIncomingPromotionRun]);

  const fetchPromotionRunStatus = useCallback(
    async (runId?: number, options?: { announce?: boolean }) => {
      try {
        const params = new URLSearchParams();
        if (runId) {
          params.set('runId', runId.toString());
        } else {
          params.set('statusOnly', 'true');
        }
        const res = await fetch(`/api/academic-years/auto-promote?${params.toString()}`, {
          credentials: 'include',
        });
        const result = await res.json();
        if (result.success) {
          const run = result.data.run || result.data.latestRun || null;
          handleIncomingPromotionRun(run, options?.announce);
          return run as PromotionRun | null;
        }
        toast.error(result.error || 'Failed to fetch promotion status');
      } catch (error) {
        console.error('Error fetching promotion status:', error);
        toast.error('Failed to fetch promotion status');
      }
      return null;
    },
    [handleIncomingPromotionRun]
  );

  useEffect(() => {
    if (!promotionRun || !isPromotionRunActive(promotionRun)) return;
    const intervalId = window.setInterval(async () => {
      const latestRun = await fetchPromotionRunStatus(promotionRun.id, { announce: true });
      if (latestRun && !isPromotionRunActive(latestRun)) {
        fetchAcademicYears(academicYearPage);
      }
    }, 3000);
    return () => window.clearInterval(intervalId);
  }, [academicYearPage, fetchAcademicYears, fetchPromotionRunStatus, isPromotionRunActive, promotionRun]);

  const handleAcademicYearFormChange = (
    field: keyof typeof academicYearFormData,
    value: string | boolean
  ) => {
    setAcademicYearFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSaveAcademicYearSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingAcademicYear(true);

    const selectedAcademicYear = activeAcademicYearId
      ? academicYears.find((academicYear) => academicYear.id === activeAcademicYearId) ||
        activeAcademicYear
      : null;
    const data = {
      year: academicYearFormData.year,
      startDate: academicYearFormData.startDate,
      endDate: academicYearFormData.endDate,
      semester: academicYearFormData.semester || selectedAcademicYear?.semester || '1ST',
      promotionDate: academicYearFormData.promotionDate || null,
      isActive: academicYearFormData.isActive,
    };

    try {
      const url = activeAcademicYearId
        ? `/api/academic-years?id=${activeAcademicYearId}`
        : '/api/academic-years';

      const res = await fetch(url, {
        method: activeAcademicYearId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await res.json();

      if (result.success) {
        const savedAcademicYear = result.data as AcademicYear | undefined;
        toast.success('Academic year settings saved successfully');
        if (savedAcademicYear?.id) {
          setAcademicYears((current) => upsertAcademicYear(current, savedAcademicYear));
          setActiveAcademicYearId(savedAcademicYear.id);
          setActiveAcademicYear((current) =>
            savedAcademicYear.isActive
              ? savedAcademicYear
              : current?.id === savedAcademicYear.id
                ? null
                : current
          );
          setAcademicYearFormData({
            year: savedAcademicYear.year,
            startDate: formatDateForInput(savedAcademicYear.startDate),
            endDate: formatDateForInput(savedAcademicYear.endDate),
            semester: savedAcademicYear.semester || '1ST',
            promotionDate: formatDateForInput(savedAcademicYear.promotionDate),
            isActive: savedAcademicYear.isActive,
          });
        }
        invalidateAcademicYearsCache();
        if (!savedAcademicYear?.id) {
          void fetchAcademicYears(academicYearPage);
        }
      } else {
        toast.error(result.error || 'Failed to save academic year');
      }
    } catch (error) {
      console.error('Error saving academic year:', error);
      toast.error('Failed to save academic year');
    } finally {
      setIsSubmittingAcademicYear(false);
    }
  };

  const handleDeleteAcademicYear = async (id: number) => {
    if (!confirm('Are you sure you want to delete this academic year? This cannot be undone.')) return;

    setIsSubmittingAcademicYear(true);
    try {
      const res = await fetch(`/api/academic-years?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Academic year deleted successfully');
        invalidateAcademicYearsCache();
        void fetchAcademicYears(academicYearPage);
      } else {
        toast.error(result.error || 'Failed to delete academic year');
      }
    } catch (error) {
      console.error('Error deleting academic year:', error);
      toast.error('Failed to delete academic year');
    } finally {
      setIsSubmittingAcademicYear(false);
    }
  };

  const handleEditAcademicYear = (ay: AcademicYear) => {
    setActiveAcademicYearId(ay.id);
    setActiveAcademicYear(ay.isActive ? ay : null);
    setAcademicYearFormData({
      year: ay.year,
      startDate: formatDateForInput(ay.startDate),
      endDate: formatDateForInput(ay.endDate),
      semester: ay.semester || '1ST',
      promotionDate: formatDateForInput(ay.promotionDate),
      isActive: ay.isActive,
    });
  };

  const handleAddAcademicYear = () => {
    setActiveAcademicYearId(null);
    setActiveAcademicYear(null);
    setAcademicYearFormData({ ...getDefaultAcademicYearFormData(), isActive: false });
  };

  const invalidateAcademicYearsCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['academicYears'] });
  }, [queryClient]);

  const handleSetActiveAcademicYear = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`/api/academic-years?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include',
      });
      const result = await res.json();
      if (result.success) {
        const savedAcademicYear = result.data as AcademicYear | undefined;
        toast.success('Active academic year updated successfully');
        setAcademicYears((current) => markActiveAcademicYear(current, id));
        if (savedAcademicYear?.id) {
          setActiveAcademicYear(savedAcademicYear);
          setActiveAcademicYearId(savedAcademicYear.id);
          setAcademicYearFormData({
            year: savedAcademicYear.year,
            startDate: formatDateForInput(savedAcademicYear.startDate),
            endDate: formatDateForInput(savedAcademicYear.endDate),
            semester: savedAcademicYear.semester || '1ST',
            promotionDate: formatDateForInput(savedAcademicYear.promotionDate),
            isActive: savedAcademicYear.isActive,
          });
        }
        invalidateAcademicYearsCache();
        if (!savedAcademicYear?.id) {
          void fetchAcademicYears(academicYearPage);
        }
      } else {
        toast.error(result.error || 'Failed to update active academic year');
      }
    } catch (error) {
      console.error('Error updating active academic year:', error);
      toast.error('Failed to update active academic year');
    }
  };

  const handleOpenPromotionDialog = async () => {
    setIsPromotionDialogOpen(true);
    await fetchPromotionPreview();
  };

  const handleTransitionDecisionChange = (studentId: number, decision: StudentTransitionDecision) => {
    setTransitionDecisions((current) => ({ ...current, [studentId]: decision }));
  };

  const handleSaveTransitionDecisions = async () => {
    if (!promotionPreview) return;

    const decisions = promotionPreview.preview
      .filter((student) => transitionDecisions[student.id])
      .map((student) => ({
        studentId: student.id,
        decision: transitionDecisions[student.id],
      }));

    if (decisions.length === 0) {
      toast.error('Select at least one transition decision first.');
      return;
    }

    setIsSavingTransitionDecisions(true);
    try {
      const res = await fetch('/api/academic-years/auto-promote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions }),
        credentials: 'include',
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || 'Failed to save transition decisions');
        return;
      }
      toast.success(result.message || 'Transition decisions saved');
      await fetchPromotionPreview();
    } catch (error) {
      console.error('Error saving transition decisions:', error);
      toast.error('Failed to save transition decisions');
    } finally {
      setIsSavingTransitionDecisions(false);
    }
  };

  const handleAutoPromoteStudents = async () => {
    toast.message('Use Promotion Level to select continuing students before processing promotion.');
    setIsPromotionDialogOpen(false);
    window.location.href = '/registry';
  };

  const handleUndoPromotion = async () => {
    if (
      !confirm(
        'This will restore students from the last promotion backup and allow this academic year to be promoted again. Continue?'
      )
    )
      return;

    setIsUndoingPromotion(true);
    try {
      const res = await fetch('/api/academic-years/auto-promote', {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Last promotion undone successfully');
        setPromotionRun(null);
        setPromotionPreview(null);
        invalidateAcademicYearsCache();
        void fetchAcademicYears(academicYearPage);
      } else {
        toast.error(result.error || 'Failed to undo promotion');
      }
    } catch (error) {
      console.error('Error undoing promotion:', error);
      toast.error('Failed to undo promotion');
    } finally {
      setIsUndoingPromotion(false);
    }
  };

  const activePromotionRun =
    promotionRun && activeAcademicYear?.id === promotionRun.academicYearId ? promotionRun : null;
  const isActivePromotionProcessing = isPromotionRunActive(activePromotionRun);
  const dialogPromotionRun =
    promotionRun && promotionPreview?.activeAcademicYear?.id === promotionRun.academicYearId
      ? promotionRun
      : null;
  const isDialogPromotionProcessing = isPromotionRunActive(dialogPromotionRun);
  const promotionDecisionBlockers =
    promotionPreview?.preview.filter((student) => student.requiresDecision) || [];
  const hasPromotionDecisionBlockers = promotionDecisionBlockers.length > 0;
  const canStartDialogPromotion = Boolean(
    promotionPreview?.activeAcademicYear &&
      !promotionPreview.activeAcademicYear.promotionProcessedAt &&
      !isDialogPromotionProcessing &&
      !hasPromotionDecisionBlockers
  );
  const canReviewDialogPromotion = Boolean(
    promotionPreview?.activeAcademicYear &&
      !promotionPreview.activeAcademicYear.promotionProcessedAt &&
      !isDialogPromotionProcessing
  );
  const canUndoPromotion = Boolean(activeAcademicYear?.promotionProcessedAt);

  if (loadingAcademicYears) {
    return <AcademicYearSettingsSkeleton />;
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <GraduationCap className="h-5 w-5" />
              Academic Year Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              {canUndoPromotion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndoPromotion}
                  disabled={isUndoingPromotion}
                  className="gap-2"
                >
                  {isUndoingPromotion ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Undo Last Promotion
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAcademicYear}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
              <Button
                size="sm"
                onClick={handleOpenPromotionDialog}
                disabled={!activeAcademicYear}
                className="gap-2"
                style={{
                  background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
                  boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
                }}
              >
                <GraduationCap className="h-4 w-4" />
                Review Promotion
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Academic Year Form */}
          <form onSubmit={handleSaveAcademicYearSettings}>
            <div className="mb-6 space-y-4 border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {activeAcademicYearId ? 'Edit Academic Year' : 'Create New Academic Year'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeAcademicYearId
                      ? 'Modify the settings for this academic year.'
                      : 'Configure a new academic year for the system.'}
                  </p>
                </div>
                {academicYearFormData.isActive && (
                  <Badge className="bg-green-600 text-white">Currently Active</Badge>
                )}
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Important Note</p>
                    <p>
                      Academic year dates determine the enrollment period. Make sure the dates are
                      accurate before setting as active.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ay-year">Academic Year</Label>
                  <Input
                    id="ay-year"
                    placeholder="e.g., 2025-2026"
                    value={academicYearFormData.year}
                    onChange={(e) => handleAcademicYearFormChange('year', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ay-semester">Semester</Label>
                  <Select
                    value={academicYearFormData.semester}
                    onValueChange={(value) => handleAcademicYearFormChange('semester', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOLARSHIP_TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {SCHOLARSHIP_TERM_LABELS[term as keyof typeof SCHOLARSHIP_TERM_LABELS] || term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ay-start-date">Start Date</Label>
                  <Input
                    id="ay-start-date"
                    type="date"
                    value={academicYearFormData.startDate}
                    onChange={(e) => handleAcademicYearFormChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ay-end-date">End Date</Label>
                  <Input
                    id="ay-end-date"
                    type="date"
                    value={academicYearFormData.endDate}
                    onChange={(e) => handleAcademicYearFormChange('endDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ay-promotion-date">Promotion Date</Label>
                  <Input
                    id="ay-promotion-date"
                    type="date"
                    value={academicYearFormData.promotionDate}
                    onChange={(e) => handleAcademicYearFormChange('promotionDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ay-is-active">Active Status</Label>
                  <Select
                    value={academicYearFormData.isActive ? 'true' : 'false'}
                    onValueChange={(value) =>
                      handleAcademicYearFormChange('isActive', value === 'true')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingAcademicYear}
                  className="gap-2"
                  style={{
                    background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
                    boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
                  }}
                >
                  {isSubmittingAcademicYear ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Academic Year
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Academic Years List */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">All Academic Years</h3>
            </div>

            {academicYears.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No academic years found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Create an academic year to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Promotion Date</TableHead>
                      <TableHead>Promotion Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {academicYears.map((ay) => {
                      const promoStatus = getPromotionStatus(ay);
                      return (
                        <TableRow
                          key={ay.id}
                          className={
                            ay.id === activeAcademicYearId ? 'bg-emerald-50/50' : undefined
                          }
                        >
                          <TableCell className="font-medium">{ay.year}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {SCHOLARSHIP_TERM_LABELS[
                                ay.semester as keyof typeof SCHOLARSHIP_TERM_LABELS
                              ] || ay.semester}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ay.startDate)}</TableCell>
                          <TableCell>{formatDate(ay.endDate)}</TableCell>
                          <TableCell>{formatDate(ay.promotionDate)}</TableCell>
                          <TableCell>
                            {promoStatus.className ? (
                              <Badge className={promoStatus.className}>
                                {promoStatus.label}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {promoStatus.label}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {ay.isActive ? (
                              <Badge className="bg-green-600 text-white">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!ay.isActive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetActiveAcademicYear(ay.id, true)}
                                  disabled={isSubmittingAcademicYear}
                                  className="h-8 w-8 p-0"
                                  title="Set as active"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAcademicYear(ay)}
                                disabled={isSubmittingAcademicYear}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAcademicYear(ay.id)}
                                disabled={isSubmittingAcademicYear}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {academicYearTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {academicYearPage} of {academicYearTotalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={academicYearPage <= 1}
                    onClick={() => fetchAcademicYears(academicYearPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={academicYearPage >= academicYearTotalPages}
                    onClick={() => fetchAcademicYears(academicYearPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Promotion Dialog */}
      {isPromotionDialogOpen && promotionPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[85vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Promotion Review
                  {promotionPreview.activeAcademicYear && (
                    <span className="ml-2 text-muted-foreground">
                      ({promotionPreview.activeAcademicYear.year})
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review student promotions for the current academic year.
                  {hasPromotionDecisionBlockers &&
                    ' Some students require decisions before promotion can proceed.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canReviewDialogPromotion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveTransitionDecisions}
                    disabled={isSavingTransitionDecisions}
                    className="gap-2"
                  >
                    {isSavingTransitionDecisions ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Decisions
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleAutoPromoteStudents}
                  disabled={!canStartDialogPromotion || isDialogPromotionProcessing}
                  className="gap-2"
                  style={{
                    background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
                    boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
                  }}
                >
                  {isDialogPromotionProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4" />
                      Start Promotion
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPromotionDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>

            {dialogPromotionRun && (
              <div className="mb-4 rounded-md border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDialogPromotionProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : dialogPromotionRun.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : dialogPromotionRun.status === 'FAILED' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Last Run:</span>
                    <Badge className={getPromotionRunBadge(dialogPromotionRun).className}>
                      {getPromotionRunBadge(dialogPromotionRun).label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getPromotionRunProcessedCount(dialogPromotionRun)} /{' '}
                    {dialogPromotionRun.totalStudents} processed
                  </div>
                </div>
              </div>
            )}

            {/* Promotion preview table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Current Grade</TableHead>
                    <TableHead>Next Grade</TableHead>
                    <TableHead>Action</TableHead>
                    {hasPromotionDecisionBlockers && <TableHead>Decision Required</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionPreview.preview.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.lastName}, {student.firstName}
                      </TableCell>
                      <TableCell>{student.gradeLevel}</TableCell>
                      <TableCell>{student.nextGradeLevel || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.action === 'GRADUATE'
                              ? 'bg-green-600 text-white'
                              : student.action === 'PROMOTE'
                                ? 'bg-blue-600 text-white'
                                : student.action === 'RETAIN'
                                  ? 'bg-amber-500 text-white'
                                  : student.action === 'SKIP'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-red-600 text-white'
                          }
                        >
                          {student.action}
                        </Badge>
                      </TableCell>
                      {hasPromotionDecisionBlockers && (
                        <TableCell>
                          {student.requiresDecision ? (
                            <Select
                              value={transitionDecisions[student.id] || ''}
                              onValueChange={(value) =>
                                handleTransitionDecisionChange(
                                  student.id,
                                  value as StudentTransitionDecision
                                )
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select decision" />
                              </SelectTrigger>
                              <SelectContent>
                                {getPromotionDecisionOptions({
                                  gradeLevel: student.gradeLevel,
                                  yearLevel: student.yearLevel,
                                }).map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {STUDENT_TRANSITION_DECISION_LABELS[
                                      option as keyof typeof STUDENT_TRANSITION_DECISION_LABELS
                                    ] || option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hasPromotionDecisionBlockers && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">
                      {promotionDecisionBlockers.length} student(s) require a transition decision
                    </p>
                    <p>
                      Select the appropriate promotion decision for each student above before
                      proceeding.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
