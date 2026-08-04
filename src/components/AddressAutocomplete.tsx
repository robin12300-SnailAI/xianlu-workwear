'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { addressProvider, type AddressSuggestion, type ParsedAddress } from '@/lib/address';

interface AddressAutocompleteProps {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  countryCode?: string;
  onChange: (value: string) => void;
  onSelect: (parsed: ParsedAddress) => void;
}

export default function AddressAutocomplete({
  id: externalId,
  label,
  required,
  value,
  placeholder = 'Start typing your address',
  countryCode = 'au',
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const listId = `${inputId}-suggestions`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [highlighted, setHighlighted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Debounced search as the user types.
  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setFetchError(false);
      return;
    }

    setLoading(true);
    setFetchError(false);
    const timer = setTimeout(async () => {
      try {
        const results = await addressProvider.search(value, countryCode);
        if (results.length > 0) {
          setSuggestions(results);
          setHighlighted(0);
          setOpen(true);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      } catch {
        setFetchError(true);
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [value, countryCode]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectSuggestion = useCallback(
    (index: number) => {
      const suggestion = suggestions[index];
      if (!suggestion) return;
      onChange(suggestion.parsed.street);
      onSelect(suggestion.parsed);
      setOpen(false);
      inputRef.current?.blur();
    },
    [suggestions, onChange, onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          setHighlighted((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlighted(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (open) selectSuggestion(highlighted);
          break;
        case 'Escape':
          setOpen(false);
          inputRef.current?.blur();
          break;
        case 'Tab':
          setOpen(false);
          break;
      }
    },
    [open, suggestions.length, highlighted, selectSuggestion],
  );

  return (
    <div className="address-autocomplete" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="address-label">
          {label}
          {required && <span className="address-required"> *</span>}
        </label>
      )}
      <div className="address-input-wrap">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={
            open ? `${listId}-item-${highlighted}` : undefined
          }
          role="combobox"
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            value.length >= 3 && suggestions.length > 0 && setOpen(true)
          }
          className="address-input"
        />
        {loading && (
          <span className="address-spinner" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                d="M14 8a6 6 0 11-3.5-5.47"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </div>

      {open && (
        <ul id={listId} className="address-suggestions" role="listbox">
          {suggestions.map((suggestion, idx) => (
            <li
              key={suggestion.id}
              id={`${listId}-item-${idx}`}
              role="option"
              aria-selected={idx === highlighted}
              className={`address-suggestion ${
                idx === highlighted ? 'address-suggestion-active' : ''
              }`}
              onMouseEnter={() => setHighlighted(idx)}
              onClick={() => selectSuggestion(idx)}
            >
              <span className="suggestion-main">
                {suggestion.parsed.street}
              </span>
              <span className="suggestion-sub">
                {[suggestion.parsed.city, suggestion.parsed.state, suggestion.parsed.postcode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </li>
          ))}
          <li className="address-attribution" aria-hidden="true">
            Address data via OpenStreetMap
          </li>
        </ul>
      )}

      {fetchError && value.length >= 3 && !loading && (
        <p className="address-helper">
          Unable to load suggestions. You can still type your address manually.
        </p>
      )}

      <style jsx>{`
        .address-autocomplete {
          position: relative;
        }
        .address-label {
          display: block;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 0.35rem;
        }
        .address-required {
          color: #e11d48;
        }
        .address-input-wrap {
          position: relative;
        }
        .address-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          padding-right: 2.25rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--ink);
          font-size: 0.9rem;
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .address-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .address-input::placeholder {
          color: var(--muted);
          opacity: 0.7;
        }
        .address-spinner {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          margin-top: -8px;
          color: var(--muted);
          display: inline-flex;
        }
        .address-spinner svg {
          animation: address-spin 0.8s linear infinite;
        }
        @keyframes address-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .address-suggestions {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 50;
          margin: 0;
          padding: 0.35rem 0;
          list-style: none;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          max-height: 280px;
          overflow-y: auto;
        }
        .address-suggestion {
          padding: 0.55rem 0.85rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          transition: background 0.12s ease;
        }
        .address-suggestion:hover,
        .address-suggestion-active {
          background: var(--accent-soft);
        }
        .suggestion-main {
          font-size: 0.9rem;
          color: var(--ink);
          font-weight: 500;
        }
        .suggestion-sub {
          font-size: 0.78rem;
          color: var(--muted);
        }
        .address-attribution {
          padding: 0.4rem 0.85rem;
          font-size: 0.7rem;
          color: var(--muted);
          opacity: 0.8;
          border-top: 1px solid var(--border);
          margin-top: 0.2rem;
        }
        .address-helper {
          margin-top: 0.35rem;
          font-size: 0.76rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
