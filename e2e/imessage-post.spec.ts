import { test, expect } from '@playwright/test';

test.describe('iMessage Post Component', () => {
    test('should display the iMessage demo page', async ({ page }) => {
        // Navigate to the iMessage demo page
        await page.goto('/imessage');

        // Check the page title
        await expect(page).toHaveTitle('iMessage Post Demo');

        // Check that the main page heading is visible
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('iMessage Post Demo');

        // Check that the iMessage component is rendered
        const iMessageComponent = page.locator('.card');
        await expect(iMessageComponent).toBeVisible();

        // Verify participant name is displayed
        await expect(page.locator('text=Alice')).toBeVisible();

        // Verify messages are displayed
        await expect(page.locator('text="Hey, how\'s it going?"')).toBeVisible();

        // Check the features list section
        const featuresList = page.locator('ul.list-disc');
        await expect(featuresList).toBeVisible();

        // Verify at least one feature list item
        const firstFeature = featuresList.locator('li').first();
        await expect(firstFeature).toBeVisible();
    });

    test('iMessage component should be responsive', async ({ page }) => {
        // Navigate to the demo page
        await page.goto('/imessage');

        // Save a screenshot of desktop view
        await page.screenshot({ path: 'imessage-desktop.png' });

        // Resize to mobile size
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify the component is still visible
        const iMessageComponent = page.locator('.card');
        await expect(iMessageComponent).toBeVisible();

        // Save a screenshot of mobile view
        await page.screenshot({ path: 'imessage-mobile.png' });
    });

    test('message bubbles should have correct styling', async ({ page }) => {
        await page.goto('/imessage');

        // Find all message bubbles
        const rightBubbles = page.locator('.bg-primary');
        const leftBubbles = page.locator('.bg-base-200');

        // Verify we have both types of bubbles
        await expect(rightBubbles).toBeVisible();
        await expect(leftBubbles).toBeVisible();

        // Check for correct message content
        const lastBubble = page.locator('.bg-primary').last();
        await expect(lastBubble).toContainText('social media app');
    });
});
