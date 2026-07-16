import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination, getPaginationRange } from '@/components/shared/pagination';

type PageItem = number | '...';

describe('getPaginationRange', () => {
  it('returns all page numbers when totalPages <= 7', () => {
    expect(getPaginationRange(1, 1)).toEqual<PageItem[]>([1]);
    expect(getPaginationRange(1, 3)).toEqual<PageItem[]>([1, 2, 3]);
    expect(getPaginationRange(4, 7)).toEqual<PageItem[]>([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows ellipsis at end when current page is early', () => {
    expect(getPaginationRange(1, 10)).toEqual<PageItem[]>([1, 2, 3, 4, 5, '...', 10]);
    expect(getPaginationRange(2, 10)).toEqual<PageItem[]>([1, 2, 3, 4, 5, '...', 10]);
    expect(getPaginationRange(3, 10)).toEqual<PageItem[]>([1, 2, 3, 4, 5, '...', 10]);
  });

  it('shows ellipsis at both ends when current page is in middle', () => {
    expect(getPaginationRange(4, 10)).toEqual<PageItem[]>([1, '...', 3, 4, 5, '...', 10]);
    expect(getPaginationRange(5, 10)).toEqual<PageItem[]>([1, '...', 4, 5, 6, '...', 10]);
    expect(getPaginationRange(7, 10)).toEqual<PageItem[]>([1, '...', 6, 7, 8, '...', 10]);
  });

  it('shows ellipsis at start when current page is late', () => {
    expect(getPaginationRange(8, 10)).toEqual<PageItem[]>([1, '...', 6, 7, 8, 9, 10]);
    expect(getPaginationRange(9, 10)).toEqual<PageItem[]>([1, '...', 6, 7, 8, 9, 10]);
    expect(getPaginationRange(10, 10)).toEqual<PageItem[]>([1, '...', 6, 7, 8, 9, 10]);
  });

  describe('Pagination component', () => {
    it('renders page number buttons and Previous/Next', () => {
      const onPageChange = vi.fn();
      render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

      expect(screen.getByRole('button', { name: /page 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /page 5/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('highlights the current page', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);

      const currentButton = screen.getByRole('button', { name: /page 3/i });
      expect(currentButton).toHaveAttribute('aria-current', 'page');
    });

    it('disables Previous on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    it('disables Next on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('calls onPageChange when a page number is clicked', () => {
      const onPageChange = vi.fn();
      render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: /page 3/i }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when Previous is clicked', () => {
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: /previous/i }));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when Next is clicked', () => {
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('edge cases', () => {
    it('handles totalPages = 1', () => {
      expect(getPaginationRange(1, 1)).toEqual<PageItem[]>([1]);
    });

    it('handles totalPages = 2', () => {
      expect(getPaginationRange(1, 2)).toEqual<PageItem[]>([1, 2]);
      expect(getPaginationRange(2, 2)).toEqual<PageItem[]>([1, 2]);
    });

    it('clamps currentPage when out of bounds', () => {
      expect(getPaginationRange(0, 10)).toEqual<PageItem[]>([1, 2, 3, 4, 5, '...', 10]);
      expect(getPaginationRange(-5, 10)).toEqual<PageItem[]>([1, 2, 3, 4, 5, '...', 10]);
      expect(getPaginationRange(20, 10)).toEqual<PageItem[]>([1, '...', 6, 7, 8, 9, 10]);
    });
  });
});
