import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { describe, it, expect } from 'vitest'

describe('Button component', () => {
    it('renders correctly with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('applies default classes', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('bg-primary')
    })
})
