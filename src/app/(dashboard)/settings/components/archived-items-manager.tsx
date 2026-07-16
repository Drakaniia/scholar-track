'use client';

import { useEffect, useState } from 'react';

import { Archive, CheckSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

import {
  ARCHIVED_ITEMS_PAGE_SIZE,
  type ArchivedDeleteKind,
  type ArchivedDeleteTarget,
  type ArchivedScholarshipsResponse,
  type ArchivedStudentsResponse,
  type PermanentDeleteResponse,
  type Scholarship,
  type Student,
  getNextArchivedPageAfterDelete,
} from '../settings-types';
import { ArchivedItemsSkeleton } from './settings-table-skeleton';

export function ArchivedItemsManager() {
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [archivedScholarships, setArchivedScholarships] = useState<Scholarship[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [unarchivingItem, setUnarchivingItem] = useState<string | null>(null);
  const [selectedArchivedStudentIds, setSelectedArchivedStudentIds] = useState<number[]>([]);
  const [studentSelectAllAcrossPages, setStudentSelectAllAcrossPages] = useState(false);
  const [isBulkUnarchivingArchived, setIsBulkUnarchivingArchived] = useState(false);
  const [selectedArchivedScholarshipIds, setSelectedArchivedScholarshipIds] = useState<number[]>(
    []
  );
  const [archiveDeleteTarget, setArchiveDeleteTarget] = useState<ArchivedDeleteTarget | null>(null);
  const [isDeletingArchivedItem, setIsDeletingArchivedItem] = useState(false);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(0);
  const [scholarshipPage, setScholarshipPage] = useState(1);
  const [scholarshipTotal, setScholarshipTotal] = useState(0);
  const [scholarshipTotalPages, setScholarshipTotalPages] = useState(0);

  const fetchArchivedStudents = async (page = 1) => {
    setLoadingArchived(true);
    setStudentSelectAllAcrossPages(false);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ARCHIVED_ITEMS_PAGE_SIZE.toString(),
        archived: 'true',
      });

      const response = await fetch(`/api/students?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const result: ArchivedStudentsResponse = await response.json();

      if (result.success) {
        const visibleIds = new Set(result.data.map((student) => student.id));
        setArchivedStudents(result.data);
        setStudentPage(result.page);
        setStudentTotal(result.total);
        setStudentTotalPages(result.totalPages);
        setSelectedArchivedStudentIds((selectedIds) =>
          selectedIds.filter((studentId) => visibleIds.has(studentId))
        );
      } else {
        toast.error('Failed to load archived students');
      }
    } catch (error) {
      console.error('Error fetching archived students:', error);
      toast.error('Failed to load archived students');
    } finally {
      setLoadingArchived(false);
    }
  };

  const fetchArchivedScholarships = async (page = 1) => {
    setLoadingArchived(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ARCHIVED_ITEMS_PAGE_SIZE.toString(),
        archived: 'true',
      });

      const response = await fetch(`/api/scholarships?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const result: ArchivedScholarshipsResponse = await response.json();

      if (result.success) {
        const visibleIds = new Set(result.data.map((scholarship) => scholarship.id));
        setArchivedScholarships(result.data);
        setScholarshipPage(result.page);
        setScholarshipTotal(result.total);
        setScholarshipTotalPages(result.totalPages);
        setSelectedArchivedScholarshipIds((selectedIds) =>
          selectedIds.filter((scholarshipId) => visibleIds.has(scholarshipId))
        );
      } else {
        toast.error('Failed to load archived scholarships');
      }
    } catch (error) {
      console.error('Error fetching archived scholarships:', error);
      toast.error('Failed to load archived scholarships');
    } finally {
      setLoadingArchived(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchArchivedStudents(1);
    });
    queueMicrotask(() => {
      fetchArchivedScholarships(1);
    });
  }, []);

  const handleUnarchiveStudent = async (studentId: number) => {
    setUnarchivingItem(`student-${studentId}`);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unarchive' }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        const nextPage =
          archivedStudents.length === 1 && studentPage > 1 ? studentPage - 1 : studentPage;
        const nextTotal = Math.max(studentTotal - 1, 0);

        setArchivedStudents((students) => students.filter((student) => student.id !== studentId));
        setStudentPage(nextPage);
        setStudentTotal(nextTotal);
        setStudentTotalPages(Math.ceil(nextTotal / ARCHIVED_ITEMS_PAGE_SIZE));
        setSelectedArchivedStudentIds((selectedIds) =>
          selectedIds.filter((selectedId) => selectedId !== studentId)
        );

        toast.success('Student unarchived successfully');
        void fetchArchivedStudents(nextPage);
      } else {
        toast.error(result.error || 'Failed to unarchive student');
      }
    } catch (error) {
      console.error('Error unarchiving student:', error);
      toast.error('Failed to unarchive student');
    } finally {
      setUnarchivingItem(null);
    }
  };

  const handleBulkUnarchiveArchived = async () => {
    if (selectedArchivedStudentIds.length === 0 && !studentSelectAllAcrossPages) return;

    setIsBulkUnarchivingArchived(true);
    try {
      let payload:
        | { studentIds: number[]; action: 'unarchive' }
        | {
            selectAll: true;
            action: 'unarchive';
            filters: Record<string, string | boolean | undefined>;
          };

      if (studentSelectAllAcrossPages) {
        payload = {
          selectAll: true,
          action: 'unarchive',
          filters: { archived: true },
        };
      } else {
        payload = { studentIds: selectedArchivedStudentIds, action: 'unarchive' };
      }

      const response = await fetch('/api/students/bulk-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to bulk unarchive students');
      }

      const data = result.data;
      const count = data?.processedCount ?? 0;

      if (count > 0) {
        setSelectedArchivedStudentIds([]);
        setStudentSelectAllAcrossPages(false);
        const nextPage =
          archivedStudents.length === count && studentPage > 1 ? studentPage - 1 : studentPage;
        const nextTotal = Math.max(studentTotal - count, 0);
        setStudentPage(nextPage);
        setStudentTotal(nextTotal);
        setStudentTotalPages(Math.ceil(nextTotal / ARCHIVED_ITEMS_PAGE_SIZE));
      }

      if (data?.errorCount > 0) {
        toast.warning(`${count} student(s) unarchived, ${data.errorCount} issue(s)`);
      } else {
        toast.success(`${count} student(s) unarchived successfully`);
      }

      void fetchArchivedStudents(studentPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bulk unarchive students';
      toast.error(message);
    } finally {
      setIsBulkUnarchivingArchived(false);
    }
  };

  const handlePermanentDeleteStudents = async (studentIds: number[], selectAll?: boolean) => {
    setIsDeletingArchivedItem(true);
    try {
      const body = selectAll
        ? { selectAll: true as const, filters: { archived: true } }
        : { ids: studentIds };

      const response = await fetch('/api/students/permanent-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const result: PermanentDeleteResponse = await response.json();

      if (response.ok && result.success) {
        const deletedCount = result.data?.deletedCount ?? studentIds.length;

        if (selectAll) {
          setArchivedStudents([]);
          setSelectedArchivedStudentIds([]);
          setStudentSelectAllAcrossPages(false);
          setStudentPage(1);
          setStudentTotal(0);
          setStudentTotalPages(0);
        } else {
          const nextPage = getNextArchivedPageAfterDelete(
            archivedStudents.length,
            studentIds,
            studentPage
          );
          const nextTotal = Math.max(studentTotal - deletedCount, 0);
          const deletedIdSet = new Set(studentIds);

          setArchivedStudents((students) =>
            students.filter((student) => !deletedIdSet.has(student.id))
          );
          setSelectedArchivedStudentIds((selectedIds) =>
            selectedIds.filter((selectedId) => !deletedIdSet.has(selectedId))
          );
          setStudentPage(nextPage);
          setStudentTotal(nextTotal);
          setStudentTotalPages(Math.ceil(nextTotal / ARCHIVED_ITEMS_PAGE_SIZE));
        }

        toast.success(
          `${deletedCount} archived ${deletedCount === 1 ? 'student' : 'students'} deleted`
        );
        if (!selectAll) {
          void fetchArchivedStudents(studentPage);
        }
      } else {
        toast.error(result.error || 'Failed to delete archived students');
      }
    } catch (error) {
      console.error('Error deleting archived students:', error);
      toast.error('Failed to delete archived students');
    } finally {
      setIsDeletingArchivedItem(false);
    }
  };

  const handleUnarchiveScholarship = async (scholarshipId: number) => {
    setUnarchivingItem(`scholarship-${scholarshipId}`);
    try {
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unarchive' }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        const nextPage =
          archivedScholarships.length === 1 && scholarshipPage > 1
            ? scholarshipPage - 1
            : scholarshipPage;
        const nextTotal = Math.max(scholarshipTotal - 1, 0);

        setArchivedScholarships((scholarships) =>
          scholarships.filter((scholarship) => scholarship.id !== scholarshipId)
        );
        setScholarshipPage(nextPage);
        setScholarshipTotal(nextTotal);
        setScholarshipTotalPages(Math.ceil(nextTotal / ARCHIVED_ITEMS_PAGE_SIZE));
        setSelectedArchivedScholarshipIds((selectedIds) =>
          selectedIds.filter((selectedId) => selectedId !== scholarshipId)
        );

        toast.success('Scholarship unarchived successfully');
        void fetchArchivedScholarships(nextPage);
      } else {
        toast.error(result.error || 'Failed to unarchive scholarship');
      }
    } catch (error) {
      console.error('Error unarchiving scholarship:', error);
      toast.error('Failed to unarchive scholarship');
    } finally {
      setUnarchivingItem(null);
    }
  };

  const handlePermanentDeleteScholarships = async (scholarshipIds: number[]) => {
    setIsDeletingArchivedItem(true);
    try {
      const response = await fetch('/api/scholarships/permanent-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: scholarshipIds }),
        credentials: 'include',
      });
      const result: PermanentDeleteResponse = await response.json();

      if (response.ok && result.success) {
        const deletedCount = result.data?.deletedCount ?? scholarshipIds.length;
        const nextPage = getNextArchivedPageAfterDelete(
          archivedScholarships.length,
          scholarshipIds,
          scholarshipPage
        );
        const nextTotal = Math.max(scholarshipTotal - deletedCount, 0);
        const deletedIdSet = new Set(scholarshipIds);

        setArchivedScholarships((scholarships) =>
          scholarships.filter((scholarship) => !deletedIdSet.has(scholarship.id))
        );
        setSelectedArchivedScholarshipIds((selectedIds) =>
          selectedIds.filter((selectedId) => !deletedIdSet.has(selectedId))
        );
        setScholarshipPage(nextPage);
        setScholarshipTotal(nextTotal);
        setScholarshipTotalPages(Math.ceil(nextTotal / ARCHIVED_ITEMS_PAGE_SIZE));

        toast.success(
          `${deletedCount} archived ${deletedCount === 1 ? 'scholarship' : 'scholarships'} deleted`
        );
        void fetchArchivedScholarships(nextPage);
      } else {
        toast.error(result.error || 'Failed to delete archived scholarships');
      }
    } catch (error) {
      console.error('Error deleting archived scholarships:', error);
      toast.error('Failed to delete archived scholarships');
    } finally {
      setIsDeletingArchivedItem(false);
    }
  };

  const openArchiveDeleteDialog = (
    kind: ArchivedDeleteKind,
    ids: number[],
    label: string,
    selectAll?: boolean
  ) => {
    if (ids.length === 0 && !selectAll) return;
    setArchiveDeleteTarget({ kind, ids, label, selectAll });
  };

  const handleConfirmArchiveDelete = async () => {
    if (!archiveDeleteTarget) return;

    if (archiveDeleteTarget.kind === 'student') {
      await handlePermanentDeleteStudents(archiveDeleteTarget.ids, archiveDeleteTarget.selectAll);
    } else {
      await handlePermanentDeleteScholarships(archiveDeleteTarget.ids);
    }

    setArchiveDeleteTarget(null);
  };

  const allArchivedStudentsSelected =
    archivedStudents.length > 0 && selectedArchivedStudentIds.length === archivedStudents.length;
  const showArchivedSelectAllBanner =
    allArchivedStudentsSelected &&
    !studentSelectAllAcrossPages &&
    studentTotal > archivedStudents.length;
  const allArchivedScholarshipsSelected =
    archivedScholarships.length > 0 &&
    selectedArchivedScholarshipIds.length === archivedScholarships.length;

  if (loadingArchived) {
    return <ArchivedItemsSkeleton />;
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Archive className="h-5 w-5" />
            Archived Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {archivedStudents.length === 0 && archivedScholarships.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No archived items found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Archived students and scholarships will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Archived Students */}
              {archivedStudents.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Archived Students ({studentTotal})</h3>
                    <div className="flex items-center gap-2">
                      {selectedArchivedStudentIds.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkUnarchiveArchived}
                            disabled={isBulkUnarchivingArchived}
                            className="gap-2"
                          >
                            {isBulkUnarchivingArchived ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                            {studentSelectAllAcrossPages
                              ? 'Unarchive All'
                              : `Unarchive (${selectedArchivedStudentIds.length})`}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (studentSelectAllAcrossPages) {
                                openArchiveDeleteDialog(
                                  'student',
                                  [],
                                  'all archived students',
                                  true
                                );
                              } else {
                                openArchiveDeleteDialog(
                                  'student',
                                  selectedArchivedStudentIds,
                                  `${selectedArchivedStudentIds.length} student(s)`
                                );
                              }
                            }}
                            disabled={isDeletingArchivedItem}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {showArchivedSelectAllBanner && (
                    <div className="mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        All {archivedStudents.length} items on this page selected.{' '}
                        <button
                          className="font-medium underline hover:text-blue-800"
                          onClick={() => setStudentSelectAllAcrossPages(true)}
                        >
                          Select all {studentTotal} archived students
                        </button>
                      </span>
                    </div>
                  )}

                  {studentSelectAllAcrossPages && (
                    <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        All {studentTotal} archived students selected across all pages.
                      </span>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={allArchivedStudentsSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedArchivedStudentIds(archivedStudents.map((s) => s.id));
                                } else {
                                  setSelectedArchivedStudentIds([]);
                                  setStudentSelectAllAcrossPages(false);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Grade Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedArchivedStudentIds.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedArchivedStudentIds((prev) => [...prev, student.id]);
                                  } else {
                                    setSelectedArchivedStudentIds((prev) =>
                                      prev.filter((id) => id !== student.id)
                                    );
                                    setStudentSelectAllAcrossPages(false);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {student.lastName}, {student.firstName}
                              {student.middleInitial ? ` ${student.middleInitial}.` : ''}
                            </TableCell>
                            <TableCell>{student.program}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{student.gradeLevel}</Badge>
                            </TableCell>
                            <TableCell>{student.status}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnarchiveStudent(student.id)}
                                  disabled={unarchivingItem === `student-${student.id}`}
                                  className="h-8 w-8 p-0"
                                  title="Unarchive"
                                >
                                  {unarchivingItem === `student-${student.id}` ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openArchiveDeleteDialog(
                                      'student',
                                      [student.id],
                                      `${student.lastName}, ${student.firstName}`
                                    )
                                  }
                                  disabled={isDeletingArchivedItem}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Student Pagination */}
                  {studentTotalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {studentPage} of {studentTotalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={studentPage <= 1}
                          onClick={() => {
                            setStudentPage((p) => p - 1);
                            fetchArchivedStudents(studentPage - 1);
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={studentPage >= studentTotalPages}
                          onClick={() => {
                            setStudentPage((p) => p + 1);
                            fetchArchivedStudents(studentPage + 1);
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Archived Scholarships */}
              {archivedScholarships.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Archived Scholarships ({scholarshipTotal})
                    </h3>
                    <div className="flex items-center gap-2">
                      {selectedArchivedScholarshipIds.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            openArchiveDeleteDialog(
                              'scholarship',
                              selectedArchivedScholarshipIds,
                              `${selectedArchivedScholarshipIds.length} scholarship(s)`
                            )
                          }
                          disabled={isDeletingArchivedItem}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Selected
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={allArchivedScholarshipsSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedArchivedScholarshipIds(
                                    archivedScholarships.map((s) => s.id)
                                  );
                                } else {
                                  setSelectedArchivedScholarshipIds([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Scholarship Name</TableHead>
                          <TableHead>Sponsor</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedScholarships.map((scholarship) => (
                          <TableRow key={scholarship.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedArchivedScholarshipIds.includes(scholarship.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedArchivedScholarshipIds((prev) => [
                                      ...prev,
                                      scholarship.id,
                                    ]);
                                  } else {
                                    setSelectedArchivedScholarshipIds((prev) =>
                                      prev.filter((id) => id !== scholarship.id)
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {scholarship.scholarshipName}
                            </TableCell>
                            <TableCell>{scholarship.sponsor}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{scholarship.type}</Badge>
                            </TableCell>
                            <TableCell>{scholarship.source}</TableCell>
                            <TableCell>{formatCurrency(scholarship.amount)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnarchiveScholarship(scholarship.id)}
                                  disabled={unarchivingItem === `scholarship-${scholarship.id}`}
                                  className="h-8 w-8 p-0"
                                  title="Unarchive"
                                >
                                  {unarchivingItem === `scholarship-${scholarship.id}` ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openArchiveDeleteDialog(
                                      'scholarship',
                                      [scholarship.id],
                                      scholarship.scholarshipName
                                    )
                                  }
                                  disabled={isDeletingArchivedItem}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Scholarship Pagination */}
                  {scholarshipTotalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {scholarshipPage} of {scholarshipTotalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={scholarshipPage <= 1}
                          onClick={() => {
                            setScholarshipPage((p) => p - 1);
                            fetchArchivedScholarships(scholarshipPage - 1);
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={scholarshipPage >= scholarshipTotalPages}
                          onClick={() => {
                            setScholarshipPage((p) => p + 1);
                            fetchArchivedScholarships(scholarshipPage + 1);
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!archiveDeleteTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Permanently Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {archiveDeleteTarget?.label}?
              {archiveDeleteTarget?.selectAll ? ' This will delete ALL archived students.' : ''}{' '}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveDeleteTarget(null)}
              disabled={isDeletingArchivedItem}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmArchiveDelete}
              disabled={isDeletingArchivedItem}
              className="gap-2"
            >
              {isDeletingArchivedItem ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
