#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Format HTML email template for Zoho CRM compatibility
 * Removes any potential issues and validates inline CSS
 */
class ZohoFormatter {
    constructor() {
        this.zohoRestrictions = [
            // Remove any script tags
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            // Remove external CSS links
            /<link[^>]*rel="stylesheet"[^>]*>/gi,
            // Remove any style tags (we want inline only)
            /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
            // Remove any form elements (Zoho handles forms separately)
            /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
            // Remove any iframe elements
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ];
    }

    /**
     * Clean HTML for Zoho compatibility
     */
    cleanHTML(html) {
        let cleaned = html;
        
        // Apply Zoho restrictions
        this.zohoRestrictions.forEach(regex => {
            cleaned = cleaned.replace(regex, '');
        });

        // Ensure proper DOCTYPE
        if (!cleaned.includes('<!DOCTYPE html>')) {
            cleaned = '<!DOCTYPE html>\n' + cleaned;
        }

        // Add Zoho-specific meta tags if missing
        if (!cleaned.includes('viewport')) {
            cleaned = cleaned.replace(
                '<head>',
                '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            );
        }

        return cleaned;
    }

    /**
     * Validate inline CSS (basic check)
     */
    validateInlineCSS(html) {
        const issues = [];
        
        // Check for external resources
        if (html.includes('url(http')) {
            issues.push('External URLs found in CSS - may not work in Zoho');
        }
        
        // Check for JavaScript in CSS
        if (html.includes('javascript:')) {
            issues.push('JavaScript URLs found - not allowed in Zoho');
        }

        return issues;
    }

    /**
     * Process HTML file for Zoho compatibility
     */
    processFile(inputPath, outputPath = null) {
        try {
            const html = fs.readFileSync(inputPath, 'utf8');
            const cleaned = this.cleanHTML(html);
            const issues = this.validateInlineCSS(cleaned);
            
            // Write cleaned HTML
            const output = outputPath || inputPath.replace('.html', '-zoho.html');
            fs.writeFileSync(output, cleaned);
            
            console.log(`✅ Processed: ${path.basename(inputPath)}`);
            console.log(`📁 Output: ${output}`);
            
            if (issues.length > 0) {
                console.log('⚠️  Warnings:');
                issues.forEach(issue => console.log(`   - ${issue}`));
            }
            
            return { success: true, output, issues };
            
        } catch (error) {
            console.error(`❌ Error processing ${inputPath}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process all HTML files in a directory
     */
    processDirectory(dirPath) {
        try {
            const files = fs.readdirSync(dirPath)
                .filter(file => file.endsWith('.html'))
                .filter(file => !file.includes('-zoho.html')); // Skip already processed files
            
            console.log(`🔄 Processing ${files.length} HTML files in ${dirPath}`);
            
            const results = files.map(file => {
                const inputPath = path.join(dirPath, file);
                return this.processFile(inputPath);
            });
            
            const successful = results.filter(r => r.success).length;
            console.log(`\n✨ Complete! ${successful}/${files.length} files processed successfully.`);
            
            return results;
            
        } catch (error) {
            console.error('❌ Error processing directory:', error.message);
            return [];
        }
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const formatter = new ZohoFormatter();
    
    if (args.length === 0) {
        console.log(`
🔧 Zoho Email Template Formatter

Usage:
  node format-for-zoho.js <file.html>              # Process single file
  node format-for-zoho.js <directory>              # Process all HTML files in directory
  node format-for-zoho.js <input.html> <output.html>  # Specify output file

Examples:
  node format-for-zoho.js template.html
  node format-for-zoho.js ./email-templates/generated/
        `);
        process.exit(1);
    }
    
    const input = args[0];
    const output = args[1];
    
    // Check if input is directory or file
    const stats = fs.statSync(input);
    
    if (stats.isDirectory()) {
        formatter.processDirectory(input);
    } else if (stats.isFile()) {
        formatter.processFile(input, output);
    } else {
        console.error('❌ Input must be a file or directory');
        process.exit(1);
    }
}

module.exports = ZohoFormatter;