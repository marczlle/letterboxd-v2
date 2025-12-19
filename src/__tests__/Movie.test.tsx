import React from 'react';
import { render, screen } from '@testing-library/react';
import Movie from '@/app/components/Movie';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: { src: string | { src: string }; alt?: string } & Record<string, unknown>
  ) => {
    const { src, alt, ...rest } = props;
    const resolvedSrc = typeof src === 'string' ? src : src.src;
    return React.createElement('img', { src: resolvedSrc, alt, ...(rest as object) });
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: (
    props: { href: string; children: React.ReactNode } & Record<string, unknown>
  ) => {
    const { href, children, ...rest } = props;
    return React.createElement('a', { href, ...(rest as object) }, children);
  },
}));

describe('Movie', () => {
  it('uses fallback poster when posterPath is empty', () => {
    render(
      <Movie
        title="Filme X"
        posterPath=""
        popularity="10"
        averageRating="8.2"
        size="small"
        id="123"
      />
    );

    const img = screen.getByRole('img', { name: 'Filme X' });
    expect(img).toHaveAttribute('src', '/images/template.png');

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/movie/');
  });
});
