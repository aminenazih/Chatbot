import re
from typing import List, Tuple

def split_into_sections(text: str) -> List[str]:
    """
    Split text into sections based on newlines and potential headers.
    Preserves paragraph structure.
    """
    # Split on double newlines to separate paragraphs, but preserve the original paragraphs
    sections = re.split(r'(\n\s*\n)', text)
    
    # Recombine the sections with their separators
    result = []
    current_section = ""
    
    for i, section in enumerate(sections):
        if re.match(r'\n\s*\n', section):  # This is a separator
            if current_section:
                result.append(current_section.strip())
                current_section = ""
        else:
            current_section += section
            
    # Don't forget the last section
    if current_section:
        result.append(current_section.strip())
        
    return [s for s in result if s]

def identify_headers(text: str) -> str:
    """
    Identify and convert potential headers to Markdown headers.
    Uses more patterns and preserves all original content.
    """
    # Expanded header patterns
    patterns = [
        # Common document structure headers
        (r'^(?i)chapter\s+(\d+)[:.]?\s*(.+)$', lambda m: f"## Chapter {m.group(1)}: {m.group(2)}"),
        (r'^(?i)section\s+(\d+(?:\.\d+)*)[:.]?\s*(.+)$', lambda m: f"### {m.group(1)} {m.group(2)}"),
        (r'^(?i)appendix\s+([a-z])[:.]?\s*(.+)$', lambda m: f"### Appendix {m.group(1)}: {m.group(2)}"),
        
        # Common document parts
        (r'^(?i)(introduction|conclusion|abstract|summary|references|bibliography)[:.]?\s*$', lambda m: f"## {m.group(1).capitalize()}"),
        (r'^(?i)(introduction|conclusion|abstract|summary|references|bibliography)[:.]?\s*(.+)$', 
         lambda m: f"## {m.group(1).capitalize()}: {m.group(2)}"),
        
        # Numbered headers without keywords
        (r'^(\d+(?:\.\d+)*)\s+([A-Z][^.]+)$', lambda m: f"{'#' * min(len(m.group(1).split('.')), 6)} {m.group(2)}"),
        
        # All caps headers (common in some documents)
        (r'^([A-Z][A-Z\s]+[A-Z])$', lambda m: f"## {m.group(1)}"),
        
        # Single line headers that end with a colon
        (r'^([A-Z][^.:\n]{3,50}):$', lambda m: f"### {m.group(1)}"),
    ]
    
    lines = text.split('\n')
    formatted_lines = []
    
    for i, line in enumerate(lines):
        original_line = line
        line = line.rstrip()
        
        # Skip empty lines but preserve them in output
        if not line:
            formatted_lines.append(line)
            continue
        
        # Check if short line might be a header based on context
        is_potential_header = (
            len(line) < 100 and  # Not too long
            (i == 0 or not lines[i-1].strip()) and  # Preceded by empty line or start of text
            (i == len(lines)-1 or not lines[i+1].strip() or lines[i+1].strip().startswith('  '))  # Followed by empty line or indented text
        )
        
        if is_potential_header:
            # Try to match against patterns
            formatted = False
            for pattern, formatter in patterns:
                match = re.match(pattern, line)
                if match:
                    line = formatter(match)
                    formatted = True
                    break
                    
            # If no patterns matched but line looks like a header, make it one
            if not formatted and re.match(r'^[A-Z].*[^.!?:]$', line) and len(line) < 60:
                # Determine header level based on position and length
                if i == 0 or len(line) < 30:
                    line = f"## {line}"
                else: 
                    line = f"### {line}"
        
        formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def format_lists(text: str) -> str:
    """
    Convert bullet points and numbered lists to Markdown format.
    Handles nested lists and preserves indentation.
    """
    lines = text.split('\n')
    formatted_lines = []
    in_list = False
    list_indent = 0
    
    for i, line in enumerate(lines):
        original_line = line
        stripped_line = line.lstrip()
        current_indent = len(line) - len(stripped_line)
        
        # Detect bullet points (various symbols)
        bullet_match = re.match(r'^(\s*)([•●○∙◦\*\-]|\(\s*[a-z\d]\s*\)|\[\s*[a-z\d]\s*\])\s+(.+)$', line)
        
        # Detect numbered lists (1., 1), (1), a., a), (a), etc.)
        numbered_match = re.match(r'^(\s*)(\d+|[a-z])[.)]\s+(.+)$', line)
        
        if bullet_match:
            indent, bullet, content = bullet_match.groups()
            # Convert to markdown list format with proper indentation
            indent_spaces = ' ' * (len(indent) if in_list else 0)
            formatted_lines.append(f"{indent_spaces}* {content}")
            in_list = True
            list_indent = len(indent)
        elif numbered_match:
            indent, number, content = numbered_match.groups()
            # Convert to markdown numbered list format with proper indentation
            indent_spaces = ' ' * (len(indent) if in_list else 0)
            formatted_lines.append(f"{indent_spaces}1. {content}")
            in_list = True
            list_indent = len(indent)
        else:
            # If not a list item, check if we're continuing a list item with wrapped text
            if in_list and current_indent > list_indent and i > 0 and not lines[i-1].strip() == '':
                indent_spaces = ' ' * (list_indent + 2)  # +2 for the list marker and space
                formatted_lines.append(f"{indent_spaces}{stripped_line}")
            else:
                # No longer in a list
                in_list = current_indent >= list_indent and stripped_line
                formatted_lines.append(original_line)
    
    return '\n'.join(formatted_lines)

def format_emphasis(text: str) -> str:
    """
    Add emphasis to important terms and identify other formatting patterns.
    """
    # Bold important structural terms
    text = re.sub(r'(?<![\w*])(Definition|Theorem|Lemma|Proof|Example|Note|Remark|Corollary|Proposition)(\s*\d*\s*):', 
                 r'**\1\2:**', text)
    
    # Italic for emphasized phrases (text in quotation marks may be emphasized)
    text = re.sub(r'"([^"]{3,50})"', r'*"\1"*', text)
    
    # Bold for ALL CAPS phrases that aren't headers (likely important terms)
    text = re.sub(r'(?<!\n)([A-Z][A-Z\s]{2,20}[A-Z])(?!\n)', r'**\1**', text)
    
    # Code blocks for technical terms surrounded by backticks
    text = re.sub(r'`([^`]+)`', r'`\1`', text)
    
    return text

def detect_and_format_code_blocks(text: str) -> str:
    """
    Detect potential code blocks and format them as Markdown code blocks.
    """
    lines = text.split('\n')
    formatted_lines = []
    in_code_block = False
    consecutive_indented = 0
    
    for i, line in enumerate(lines):
        # Check if line is indented consistently (potential code)
        is_indented = re.match(r'^(\s{4,}|\t+)\S', line) is not None
        
        # Check if line contains code-like patterns
        has_code_pattern = bool(re.search(r'(if|for|while|def|class|function|var|let|const|import|from)\s', line) or
                              re.search(r'[=:<>]{1,2}[=;]?', line) or
                              re.search(r'[\{\}\[\]()]', line))
        
        if is_indented:
            consecutive_indented += 1
        else:
            consecutive_indented = 0
            
        # Start code block if we detect consistent indentation or code patterns
        if (consecutive_indented >= 2 or has_code_pattern and is_indented) and not in_code_block:
            formatted_lines.append('```')
            in_code_block = True
            
        # End code block when indentation stops
        if in_code_block and not is_indented and not has_code_pattern:
            formatted_lines.append('```')
            in_code_block = False
            
        formatted_lines.append(line)
        
    # Close any open code block
    if in_code_block:
        formatted_lines.append('```')
        
    return '\n'.join(formatted_lines)

def detect_and_format_tables(text: str) -> str:
    """
    Detect and format simple tables in the text.
    """
    lines = text.split('\n')
    formatted_lines = []
    in_table = False
    table_lines = []
    
    for i, line in enumerate(lines):
        # Check if line might be part of a table - has multiple spaces or tabs between words
        is_table_row = bool(re.search(r'\S+(\s{2,}|\t+)\S+(\s{2,}|\t+)\S+', line))
        
        if is_table_row:
            if not in_table:
                in_table = True
            table_lines.append(line)
        else:
            if in_table:
                # Process and output the detected table
                if len(table_lines) >= 2:  # Need at least header and separator
                    # Convert to markdown table
                    md_table = convert_to_markdown_table(table_lines)
                    formatted_lines.append(md_table)
                else:
                    # Not enough rows for a table, just add original lines
                    formatted_lines.extend(table_lines)
                    
                table_lines = []
                in_table = False
            formatted_lines.append(line)
    
    # Handle any remaining table at the end
    if in_table and len(table_lines) >= 2:
        md_table = convert_to_markdown_table(table_lines)
        formatted_lines.append(md_table)
    elif table_lines:
        formatted_lines.extend(table_lines)
        
    return '\n'.join(formatted_lines)

def convert_to_markdown_table(table_lines: List[str]) -> str:
    """Helper function to convert text lines to a Markdown table."""
    # Split each line into columns based on whitespace
    table_data = []
    for line in table_lines:
        columns = re.split(r'\s{2,}|\t+', line.strip())
        columns = [col.strip() for col in columns if col.strip()]
        table_data.append(columns)
    
    # Get the maximum number of columns
    max_cols = max(len(row) for row in table_data)
    
    # Normalize all rows to have the same number of columns
    for row in table_data:
        while len(row) < max_cols:
            row.append('')
    
    # Create the markdown table
    md_table = []
    md_table.append('| ' + ' | '.join(table_data[0]) + ' |')
    md_table.append('| ' + ' | '.join(['---'] * max_cols) + ' |')
    
    for row in table_data[1:]:
        md_table.append('| ' + ' | '.join(row) + ' |')
    
    return '\n'.join(md_table)

def detect_and_format_blockquotes(text: str) -> str:
    """
    Detect and format potential block quotes.
    """
    lines = text.split('\n')
    formatted_lines = []
    in_quote = False
    quote_indent = 0
    
    for i, line in enumerate(lines):
        stripped_line = line.lstrip()
        current_indent = len(line) - len(stripped_line)
        
        # Check for quote-like patterns
        is_quote = (
            # Lines that start with a quote character
            re.match(r'^\s*[""\'\'"]', line) or
            # Indented paragraphs that might be quotes
            (current_indent > 0 and
             i > 0 and i < len(lines) - 1 and
             lines[i-1].strip() == "" and
             len(stripped_line) > 20)  # Long enough to be a quote, not just indented code
        )
        
        if is_quote:
            if not in_quote:
                in_quote = True
                quote_indent = current_indent
            # Format as blockquote
            formatted_lines.append(f"> {stripped_line}")
        else:
            if in_quote and line.strip() and current_indent >= quote_indent:
                # Still part of the same quote
                formatted_lines.append(f"> {stripped_line}")
            else:
                in_quote = False
                formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def detect_links_and_references(text: str) -> str:
    """
    Detect and format URLs and potential references.
    """
    # Convert URLs to markdown links
    text = re.sub(r'(https?://[^\s\)]+)', r'[\1](\1)', text)
    
    # Detect potential references at the end of the document and format appropriately
    lines = text.split('\n')
    formatted_lines = []
    in_references = False
    ref_pattern = r'^\s*\[(\d+|[a-z])\](.+)$'
    
    for line in lines:
        if re.match(r'(?i)^(references|bibliography):?$', line.strip()):
            in_references = True
            formatted_lines.append(f"## {line.strip().capitalize()}")
        elif in_references and re.match(ref_pattern, line):
            # Format as a markdown reference
            match = re.match(ref_pattern, line)
            ref_num, ref_text = match.groups()
            formatted_lines.append(f"{ref_num}. {ref_text}")
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def format_horizontal_rules(text: str) -> str:
    """
    Add horizontal rules where appropriate.
    """
    lines = text.split('\n')
    formatted_lines = []
    
    for i, line in enumerate(lines):
        # Check for horizontal rule patterns
        if re.match(r'^[\s_*-]{3,}$', line):
            formatted_lines.append('---')
        else:
            formatted_lines.append(line)
            
        # Add horizontal rule before major sections
        if i < len(lines) - 1:
            next_line = lines[i+1]
            if (re.match(r'^#+\s+', next_line) and  # It's a header
                (i == 0 or not re.match(r'^#+\s+', lines[i]))  # Previous line not a header
               ):
                formatted_lines.append('---')
    
    return '\n'.join(formatted_lines)

def preserve_whitespace_structure(text: str) -> str:
    """
    Preserve important whitespace structure without collapsing all spaces.
    """
    # Replace tabs with spaces for consistency
    text = text.replace('\t', '    ')
    
    # Replace multiple spaces (>2) with a consistent 2 spaces except for indentation
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        # Preserve indentation at the beginning of the line
        indent_match = re.match(r'^(\s+)', line)
        if indent_match:
            indent = indent_match.group(1)
            content = line[len(indent):]
            content = re.sub(r'\s{2,}', '  ', content)
            formatted_lines.append(f"{indent}{content}")
        else:
            formatted_lines.append(re.sub(r'\s{2,}', '  ', line))
    
    return '\n'.join(formatted_lines)

def convert_text_to_markdown(extracted_text: str) -> str:
    """
    Convert plain text to well-formatted Markdown.
    
    Args:
        extracted_text (str): The plain text extracted from PDF or other document.
    
    Returns:
        str: Properly formatted Markdown text.
    """
    # First, preserve important whitespace structure
    text = preserve_whitespace_structure(extracted_text)
    
    # Split into sections while preserving paragraph structure
    sections = split_into_sections(text)
    
    # Process each section
    formatted_sections = []
    for section in sections:
        # Detect and format code blocks
        section = detect_and_format_code_blocks(section)
        
        # Convert headers
        section = identify_headers(section)
        
        # Format lists
        section = format_lists(section)
        
        # Detect and format tables
        section = detect_and_format_tables(section)
        
        # Detect and format blockquotes
        section = detect_and_format_blockquotes(section)
        
        # Add emphasis and other formatting
        section = format_emphasis(section)
        
        # Detect links and references
        section = detect_links_and_references(section)
        
        formatted_sections.append(section)
    
    # Join sections with newlines
    markdown_text = '\n\n'.join(formatted_sections)
    
    # Add horizontal rules where appropriate
    markdown_text = format_horizontal_rules(markdown_text)
    
    # Add document separator
    markdown_text = f"---\n\n{markdown_text}\n\n---"
    
    return markdown_text