def fibonacci(n):
    """
    Calculate the nth Fibonacci number.

    Args:
        n: The position in the Fibonacci sequence (0-indexed)

    Returns:
        The nth Fibonacci number
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n

    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b


def fibonacci_sequence(count):
    """
    Generate a sequence of Fibonacci numbers.

    Args:
        count: Number of Fibonacci numbers to generate

    Returns:
        List of Fibonacci numbers
    """
    if count <= 0:
        return []
    if count == 1:
        return [0]

    sequence = [0, 1]
    for i in range(2, count):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence


if __name__ == "__main__":
    # Example usage
    print(f"10th Fibonacci number: {fibonacci(10)}")
    print(f"First 10 Fibonacci numbers: {fibonacci_sequence(10)}")
