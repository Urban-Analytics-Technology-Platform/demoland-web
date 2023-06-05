import { expect, test } from 'vitest'
import { bin } from '../src/utils';

test('bin()', () => {
    expect(
        bin([0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5], 0, 10, 5)
    ).toEqual(
        [[2, 2, 2, 2, 2], [1, 3, 5, 7, 9]]
    );
    expect(
        bin([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0, 10, 5)
    ).toEqual(
        [[2, 2, 2, 2, 3], [1, 3, 5, 7, 9]]
    );
});
