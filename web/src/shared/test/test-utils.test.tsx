import { describe, it, expect } from 'vitest';
import { render, screen } from '@shared/test/test-utils';

describe('Test Infrastructure', () => {
  it('should render with providers', () => {
    render(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
