import fitz  # PyMuPDF for PDF text extraction
import logging
from typing import Dict, Any, List

# Import your improved markdown converter function
# This import path needs to match where you've stored your converter code
from app.services.markdown_service import convert_text_to_markdown  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFReader:
    def __init__(self):
        """
        PDFReader is responsible for extracting text from PDF files and converting text to Markdown.
        """
        pass
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text from a PDF file.
        
        Args:
            file_path (str): Path to the PDF file.
        
        Returns:
            str: Extracted text from the PDF.
        """
        try:
            doc = fitz.open(file_path)
            text = ""
            
            # Enhanced text extraction with better paragraph handling
            for page in doc:
                text += page.get_text("text")  # 'text' format preserves more structure
                text += "\n\n"  # Add extra newlines between pages to ensure separation
                
            logger.info(f"Successfully extracted text from PDF: {file_path}")
            return text
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {str(e)}")
            raise RuntimeError(f"Error extracting text from PDF: {str(e)}")
    
    def extract_document_structure(self, file_path: str) -> Dict[str, Any]:
        """
        Extract more detailed document structure information from PDF.
        
        Args:
            file_path (str): Path to the PDF file.
        
        Returns:
            Dict: Document structure information including metadata, TOC, etc.
        """
        try:
            doc = fitz.open(file_path)
            structure = {
                "metadata": doc.metadata,
                "page_count": len(doc),
                "toc": doc.get_toc(),
                "has_images": any(len(page.get_images()) > 0 for page in doc),
                "has_tables": self._detect_tables(doc)
            }
            
            logger.info(f"Successfully extracted document structure from PDF: {file_path}")
            return structure
        except Exception as e:
            logger.error(f"Failed to extract document structure: {str(e)}")
            return {"error": str(e)}
    
    def _detect_tables(self, doc) -> bool:
        """
        Detect if document likely contains tables.
        
        Args:
            doc: PyMuPDF document object.
        
        Returns:
            bool: True if tables likely exist in document.
        """
        # Simple heuristic - looking for common table indicators
        for page in doc:
            text = page.get_text()
            if any(pattern in text for pattern in ["Table ", "TABLE ", "| ", "+-"]):
                return True
        return False
    
    def extract_text_with_layout(self, file_path: str) -> str:
        """
        Extract text from PDF while preserving more layout information.
        
        Args:
            file_path (str): Path to the PDF file.
        
        Returns:
            str: Text with some layout preserved.
        """
        try:
            doc = fitz.open(file_path)
            text = ""
            
            for page in doc:
                # Use HTML extraction and convert to plain text with some formatting
                html = page.get_text("html")
                
                # Very basic HTML to text conversion
                # In a real implementation, you might use a proper HTML parser
                html = html.replace("<p>", "").replace("</p>", "\n\n")
                html = html.replace("<b>", "**").replace("</b>", "**")
                html = html.replace("<i>", "*").replace("</i>", "*")
                html = html.replace("<h1>", "# ").replace("</h1>", "\n\n")
                html = html.replace("<h2>", "## ").replace("</h2>", "\n\n")
                html = html.replace("<h3>", "### ").replace("</h3>", "\n\n")
                html = html.replace("<li>", "* ").replace("</li>", "\n")
                
                text += html + "\n\n"
                
            logger.info(f"Successfully extracted text with layout from PDF: {file_path}")
            return text
        except Exception as e:
            logger.error(f"Failed to extract text with layout: {str(e)}")
            raise RuntimeError(f"Error extracting text with layout from PDF: {str(e)}")
    
    def convert_text_to_markdown(self, text: str) -> str:
        """
        Convert plain text to Markdown format using the improved converter.
        
        Args:
            text (str): Plain text to convert.
        
        Returns:
            str: Markdown-formatted text.
        """
        try:
            # Call the imported convert_text_to_markdown function
            markdown_text = convert_text_to_markdown(text)
            
            logger.info("Successfully converted text to Markdown.")
            return markdown_text
        except Exception as e:
            logger.error(f"Failed to convert text to Markdown: {str(e)}")
            raise RuntimeError(f"Error converting text to Markdown: {str(e)}")
    
    def process_pdf_to_markdown(self, file_path: str) -> str:
        """
        Convenience method to extract text from PDF and convert to Markdown in one step.
        
        Args:
            file_path (str): Path to the PDF file.
        
        Returns:
            str: Markdown-formatted text from the PDF.
        """
        text = self.extract_text_from_pdf(file_path)
        return self.convert_text_to_markdown(text)