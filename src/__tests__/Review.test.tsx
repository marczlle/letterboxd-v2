import React from 'react';
import { render, screen } from '@testing-library/react';
import Review from '@/app/components/Review';

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

describe('Review', () => {
  it('renders reviewer name, text and stars', () => {
    render(
      <Review
        reviewerName="Ana"
        reviewText="Muito bom!"
        reviewerAvatar="/images/reviewer1.jpg"
        stars={5}
      />
    );

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Muito bom!')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: /reviewer avatar/i })).toHaveAttribute(
      'src',
      '/images/reviewer1.jpg'
    );
  });
});
