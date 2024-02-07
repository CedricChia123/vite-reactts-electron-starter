import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";

interface Article {
  DocID: string;
  ArticleTitle: string;
  Article_Keywords: string;
  VGs: string;
  Article_GUID: string;
  Modified_Date: number;
}

export default function SearchBar() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [fuse, setFuse] = useState<Fuse<Article> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 9;
  const pageLinkDisplayCount = 5; // Number of pagination links to display

  useEffect(() => {
    fetch("http://localhost:5000/articlesData")
      .then((response) => response.json())
      .then((data) => {
        setArticles(data);
        const fuse = new Fuse<Article>(data, {
          includeScore: true,
          keys: ["Article_Keywords"],
        });
        setFuse(fuse);
      })
      .catch((error) => console.error("Failed to fetch articles:", error));
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!fuse) return;
  
    const query = event.target.value;
    const results = fuse.search(query);
    setSearchResults(results.map((result) => result.item));
    setCurrentPage(1);
  };
  

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const displayedResults = searchResults.slice(startIndex, endIndex);
  const totalPages = Math.ceil(searchResults.length / resultsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getPaginationRange = () => {
    const halfRange = Math.floor(pageLinkDisplayCount / 2);
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, currentPage + halfRange);

    if (currentPage <= halfRange) {
      end = Math.min(pageLinkDisplayCount, totalPages);
    }
    if (currentPage > totalPages - halfRange) {
      start = Math.max(1, totalPages - pageLinkDisplayCount + 1);
    }

    return { start, end };
  };

  const { start, end } = getPaginationRange();

  return (
    <div className="flex flex-col items-center space-x-2">
      <div className="relative mb-2">
        <Input
          type="text"
          className="px-3 py-2 w-80"
          placeholder="Search..."
          onChange={handleInputChange}
        />
        <Button
          className="absolute top-1/2 right-2 transform -translate-y-1/2"
          style={{ padding: "8px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </Button>
      </div>
      <div className="search-results grid grid-cols-3 gap-4">
        {displayedResults.map((result, index) => (
          <a
            key={index}
            href={`https://ntouch.nus.edu.sg/dwp/app/#/knowledge/${result.DocID}/rkm`}
            target="_blank"
            rel="noopener noreferrer"
            className="result-item group"
          >
            <Card className="flex items-center justify-center h-full cursor-pointer relative">
              <div className="text-center">
                {result.ArticleTitle}
              </div>
            </Card>
          </a>
        ))}
      </div>
      {searchResults.length > resultsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(Math.max(1, currentPage - 1));
                }}
              />
            </PaginationItem>
            {start > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}
            {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(pageNumber => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === pageNumber}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            {end < totalPages && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(Math.min(totalPages, currentPage + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
