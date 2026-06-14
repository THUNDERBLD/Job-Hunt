;(() => {

  // ── Helpers ──────────────────────────────────────────────────
  const textOf = (el) => (el?.innerText || el?.textContent || '').trim()

  const clean = (value) =>
    String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/Open to work/ig, '')
      .trim()

  // ────────────────────────────────────────────────────────────
  //  LAYER 1 — Meta tags & structured data (most stable)
  //  LinkedIn sets og:title, og:description, and <title> on
  //  every profile page. These are part of the Open Graph
  //  protocol and have not changed in years.
  // ────────────────────────────────────────────────────────────

  const getMeta = (attr, value) => {
    const el = document.querySelector(`meta[${attr}="${value}"]`)
    return el?.content?.trim() || ''
  }

  const scrapeFromMeta = () => {
    // og:title  → "Shivani Pawar - Founder and Managing Director - SoliJuris | LinkedIn"
    // <title>   → "(1) Shivani Pawar | LinkedIn"  or  "Shivani Pawar - Founder ... | LinkedIn"
    const ogTitle = getMeta('property', 'og:title')
    const ogDesc  = getMeta('property', 'og:description')
    const pageTitle = document.title || ''

    let name = ''
    let position = ''
    let company = ''

    // ── Name from og:title ──
    // Format: "FirstName LastName - Headline | LinkedIn"
    if (ogTitle) {
      const dashIdx = ogTitle.indexOf(' - ')
      if (dashIdx > 0) {
        name = clean(ogTitle.slice(0, dashIdx))
      } else {
        // Fallback: "Name | LinkedIn"
        const pipeIdx = ogTitle.lastIndexOf(' | ')
        name = clean(pipeIdx > 0 ? ogTitle.slice(0, pipeIdx) : ogTitle)
      }
    }

    // ── Name from <title> as fallback ──
    if (!name && pageTitle) {
      let t = pageTitle.replace(/^\(\d+\)\s*/, '') // strip "(1) " notification prefix
      const pipeIdx = t.lastIndexOf(' | ')
      if (pipeIdx > 0) t = t.slice(0, pipeIdx)
      const dashIdx = t.indexOf(' - ')
      name = clean(dashIdx > 0 ? t.slice(0, dashIdx) : t)
    }

    // ── Position + Company from og:title headline part ──
    // After the first " - " in og:title is the headline: "Founder and Managing Director - SoliJuris | LinkedIn"
    if (ogTitle) {
      const dashIdx = ogTitle.indexOf(' - ')
      if (dashIdx > 0) {
        let headline = ogTitle.slice(dashIdx + 3)
        // Remove trailing " | LinkedIn"
        const pipeIdx = headline.lastIndexOf(' | ')
        if (pipeIdx > 0) headline = headline.slice(0, pipeIdx)
        headline = clean(headline)

        // Split by " - " to get position and company
        // e.g. "Founder and Managing Director - SoliJuris"
        const parts = headline.split(' - ').map(s => clean(s)).filter(Boolean)
        if (parts.length >= 2) {
          position = parts[0]
          company = parts[parts.length - 1]
        } else if (parts.length === 1) {
          // Try "at" pattern: "SDE Intern at Google"
          const atMatch = parts[0].match(/^(.+?)\s+at\s+(.+)$/i)
          if (atMatch) {
            position = clean(atMatch[1])
            company = clean(atMatch[2])
          } else {
            position = parts[0]
          }
        }
      }
    }

    // ── Company from og:description as fallback ──
    // og:description often contains "Experience: CompanyName · Education: ..."
    if (!company && ogDesc) {
      const expMatch = ogDesc.match(/Experience:\s*([^·|]+)/i)
      if (expMatch) company = clean(expMatch[1])
    }

    return { name, position, company }
  }

  // ────────────────────────────────────────────────────────────
  //  LAYER 1.5 — JSON-LD Structured Data (stable, class-agnostic)
  //  LinkedIn includes schema.org JSON-LD scripts for search engines
  //  which are standardized and independent of CSS class hashes.
  // ────────────────────────────────────────────────────────────

  const scrapeFromJSONLD = () => {
    try {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      for (const script of scripts) {
        const text = (script.textContent || '').trim()
        if (!text) continue
        const data = JSON.parse(text)

        // Find standard Person entity
        const findPerson = (obj) => {
          if (!obj || typeof obj !== 'object') return null
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const res = findPerson(item)
              if (res) return res
            }
          } else {
            if (obj['@type'] === 'Person' || (typeof obj['@type'] === 'string' && obj['@type'].includes('Person'))) {
              return obj
            }
            for (const key of Object.keys(obj)) {
              const res = findPerson(obj[key])
              if (res) return res
            }
          }
          return null
        }

        const person = findPerson(data)
        if (person) {
          const name = clean(person.name || '')
          const position = clean(person.jobTitle || '')
          let company = ''
          if (person.worksFor) {
            const orgs = Array.isArray(person.worksFor) ? person.worksFor : [person.worksFor]
            const primaryOrg = orgs.find(o => o.name)
            if (primaryOrg) {
              company = clean(primaryOrg.name || '')
            }
          }
          if (name || position || company) {
            return { name, position, company }
          }
        }
      }
    } catch (err) {
      console.log('[JobHunt] JSON-LD parse error:', err)
    }
    return null
  }

  // ────────────────────────────────────────────────────────────
  //  LAYER 2 — Semantic DOM Heuristics (class-independent)
  //  Uses tag-based selectors, titles, and relationship siblings.
  // ────────────────────────────────────────────────────────────

  const scrapeNameFromDOM = () => {
    // 1. Check H1/H2 tags matching document.title (clean notification counts like "(1)")
    const titleName = clean((document.title || '').replace(/^\(\d+\)\s*/, '').split('|')[0]).trim()
    const headers = Array.from(document.querySelectorAll('h1, h2'))
    
    for (const h of headers) {
      const text = clean(h.textContent || '')
      if (text.length > 1 && titleName.toLowerCase().includes(text.toLowerCase()) && !text.includes('LinkedIn')) {
        return text
      }
    }

    // 2. Try h1.text-heading-xlarge or specific elements
    const specific = document.querySelector('h1.text-heading-xlarge, .pv-text-details__left-panel h1, [data-field="name"]')
    if (specific) {
      const text = clean(specific.textContent || '')
      if (text.length > 1 && text.length < 80) return text
    }

    // 3. Fallback to first sensible h2 or h1
    for (const h of headers) {
      const text = clean(h.textContent || '')
      if (text.length > 1 && text.length < 60 && !text.includes('LinkedIn') && !text.includes('connection')) {
        return text
      }
    }
    return ''
  }

  const scrapeHeadlineFromDOM = (name) => {
    const targetName = name || clean((document.title || '').replace(/^\(\d+\)\s*/, '').split('|')[0]).trim()

    // 1. Scan <p> tags for typical headlines (very class-agnostic and robust)
    const paras = Array.from(document.querySelectorAll('p'))
    for (const p of paras) {
      const txt = clean(p.textContent || '')
      if (txt.length > 15 && txt.length < 250) {
        const lower = txt.toLowerCase()
        if (
          !lower.includes(targetName.toLowerCase()) &&
          !lower.includes('connection') &&
          !lower.includes('contact info') &&
          !lower.includes('mutual') &&
          !lower.includes('linkedin') &&
          !lower.includes('sign in') &&
          !lower.includes('join now') &&
          (lower.includes('|') || lower.includes(' at ') || lower.includes(' @ ') || 
           lower.includes('developer') || lower.includes('engineer') || lower.includes('founder') || 
           lower.includes('lead') || lower.includes('manager') || lower.includes('student') ||
           lower.includes('director') || lower.includes('intern') || lower.includes('analyst') ||
           lower.includes('head') || lower.includes('architect') || lower.includes('designer'))
        ) {
          return txt
        }
      }
    }

    // 2. Look for sibling/descendant paragraphs/divs near the name element
    const headers = Array.from(document.querySelectorAll('h1, h2'))
    let nameEl = null
    
    for (const h of headers) {
      if (clean(h.textContent || '').toLowerCase().includes(targetName.toLowerCase())) {
        nameEl = h
        break
      }
    }

    if (nameEl) {
      let parent = nameEl.parentElement
      for (let i = 0; i < 4; i++) {
        if (!parent) break
        const textElements = Array.from(parent.querySelectorAll('p, div, span'))
        for (const el of textElements) {
          const txt = clean(el.textContent || '')
          // Filter out Name, degree, and empty/useless texts
          if (
            txt.length > 5 && 
            txt.length < 250 && 
            !txt.toLowerCase().includes(targetName.toLowerCase()) && 
            !txt.includes('connections') && 
            !txt.includes('Contact info') &&
            !txt.includes('Mutual connection') &&
            !txt.includes('First connection')
          ) {
            return txt
          }
        }
        parent = parent.parentElement
      }
    }

    // 3. Specific selectors fallback
    const selectors = [
      '.text-body-medium.break-words',
      '[data-field="headline"]',
      '.pv-text-details__left-panel .text-body-medium',
      'main .text-body-medium',
    ]
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel)
        if (el) {
          const t = clean(el.textContent || '')
          if (t.length > 1) return t
        }
      } catch (_) {}
    }
    return ''
  }

  const scrapeCompanyFromDOM = (name) => {
    const targetName = name || clean((document.title || '').replace(/^\(\d+\)\s*/, '').split('|')[0]).trim()

    // 1. Find <strong> tags inside /company/ links
    const strongs = Array.from(document.querySelectorAll('strong'))
    for (const s of strongs) {
      const nearestLink = s.closest('a')
      const href = nearestLink?.href || ''
      if (href.includes('/company/')) {
        const text = clean(s.textContent || '')
        if (text.length > 1 && text.length < 100) return text
      }
    }

    // 2. Scope search to profile card: find name H2, walk up, search within
    const headers = Array.from(document.querySelectorAll('h1, h2'))
    let nameEl = null
    for (const h of headers) {
      const txt = clean(h.textContent || '')
      if (txt.length > 1 && targetName && txt.toLowerCase().includes(targetName.toLowerCase())) {
        nameEl = h
        break
      }
    }

    if (nameEl) {
      let card = nameEl
      for (let i = 0; i < 8; i++) {
        if (!card.parentElement) break
        card = card.parentElement
      }

      // a) /company/ links inside the card area
      const cardLinks = Array.from(card.querySelectorAll('a[href*="/company/"]'))
      for (const link of cardLinks) {
        const text = clean(link.textContent || '')
        if (text.length > 1 && text.length < 100 && !text.includes('logo') && !text.includes('Image')) {
          return text
        }
      }

      // b) <strong> tags inside the card (company name is bold in top card)
      const cardStrongs = Array.from(card.querySelectorAll('strong'))
      for (const s of cardStrongs) {
        const text = clean(s.textContent || '')
        if (text.length > 1 && text.length < 80) {
          const lower = text.toLowerCase()
          if (targetName && lower.includes(targetName.toLowerCase())) continue
          if (/connection|contact|message|follow|mutual|degree/i.test(lower)) continue
          const nearestLink = s.closest('a')
          if (nearestLink?.href?.includes('/in/')) continue
          return text
        }
      }
    }

    // 3. Parse document.title: "Name - Position - Company | LinkedIn"
    const titleStr = (document.title || '').replace(/^\(\d+\)\s*/, '')
    const titleParts = titleStr.split('|')[0].split(' - ').map(s => s.trim()).filter(Boolean)
    if (titleParts.length >= 3) {
      const companyFromTitle = titleParts[titleParts.length - 1]
      if (companyFromTitle.length > 1 && !companyFromTitle.toLowerCase().includes('linkedin')) {
        return companyFromTitle
      }
    }

    return ''
  }

  const scrapeFromExperience = () => {
    const expSection = document.querySelector('#experience')
    if (!expSection) return { position: '', company: '' }

    let container = expSection.closest('section')
    if (!container) {
      let el = expSection
      for (let i = 0; i < 5; i++) {
        el = el.parentElement
        if (!el) break
        if (el.tagName === 'SECTION') { container = el; break }
      }
    }
    if (!container) return { position: '', company: '' }

    // Get all top-level list items in the experience section (not nested inside other list items)
    const items = Array.from(container.querySelectorAll('li'))
      .filter(li => {
        const parentLi = li.parentElement?.closest('li')
        return !parentLi
      })
      
    if (!items.length) return { position: '', company: '' }

    const first = items[0]
    
    // Check if there is a nested list (indicates multiple roles at the same company)
    // We make sure it is a list of roles by checking if any item contains date/duration patterns
    const nestedList = Array.from(first.querySelectorAll('ul')).find(ul => {
      const lis = ul.querySelectorAll('li')
      if (!lis.length) return false
      const durationPattern = /\d{4}|Present|mos|yr/i
      return Array.from(lis).some(li => durationPattern.test(li.textContent || ''))
    })
    
    if (nestedList) {
      // Grouped / Multi-role structure
      const allSpans = Array.from(first.querySelectorAll('span[aria-hidden="true"]'))
        .map(s => clean(s.textContent || ''))
        .filter(s => s.length > 1)
        
      const nestedSpans = Array.from(nestedList.querySelectorAll('span[aria-hidden="true"]'))
        .map(s => clean(s.textContent || ''))
        .filter(s => s.length > 1)
        
      const company = allSpans.find(s => !nestedSpans.includes(s)) || ''
      const position = nestedSpans[0] || ''
      
      return { 
        position: clean(position), 
        company: clean(company).split('·')[0].trim() 
      }
    } else {
      // Single role structure
      const spans = Array.from(first.querySelectorAll('span[aria-hidden="true"]'))
        .map(s => clean(s.textContent || ''))
        .filter(s => s.length > 1)
        
      if (spans.length >= 1) {
        const durationPattern = /\d{4}|Present|mos|yr/i
        const position = spans[0]
        let company = ''
        
        if (spans[1] && !durationPattern.test(spans[1])) {
          company = spans[1].split('·')[0].trim()
        }
        return { position, company }
      }
    }

    return { position: '', company: '' }
  }

  // ────────────────────────────────────────────────────────────
  //  LAYER 3 — Heuristic text parsing (last resort)
  //  Parses the headline string for "at" patterns.
  // ────────────────────────────────────────────────────────────

  const parseHeadlineForCompany = (headline) => {
    if (!headline) return { position: '', company: '' }

    const atMatch = headline.match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[|·-]|$)/i)
    if (atMatch) {
      return { position: clean(atMatch[1]), company: clean(atMatch[2]) }
    }

    const parts = headline.split(/\s*[|]\s*/).map(s => clean(s)).filter(Boolean)
    if (parts.length >= 2) {
      return { position: parts[0], company: '' }
    }

    return { position: headline, company: '' }
  }

  // ── Email — passive only, no modal opening ─────────────────
  const scrapeEmail = () =>
    document.querySelector('a[href^="mailto:"]')?.href?.replace('mailto:', '') || ''

  // ── Company type ───────────────────────────────────────────
  const detectType = (company) => {
    if (!company) return 'unknown'
    const mncs = [
      'google','microsoft','amazon','meta','apple','netflix','accenture',
      'infosys','wipro','tcs','cognizant','ibm','oracle','salesforce','deloitte',
      'capgemini','hcl','tech mahindra','mphasis','jp morgan','goldman','morgan stanley',
      'mckinsey','bcg','bain','pwc','kpmg','ey','intel','qualcomm','nvidia',
    ]
    return mncs.some(m => company.toLowerCase().includes(m)) ? 'mnc' : 'startup'
  }

  // ────────────────────────────────────────────────────────────
  //  MAIN SCRAPE — combines all layers with fallbacks
  // ────────────────────────────────────────────────────────────

  const scrapeProfile = () => {
    // 0. Primary structured data layer (cleanest and most stable)
    const jsonLd = scrapeFromJSONLD() || { name: '', position: '', company: '' }

    // 1. DOM-based extraction (most accurate for current visual state)
    const domName     = scrapeNameFromDOM()
    const domHeadline = scrapeHeadlineFromDOM(domName || jsonLd.name)
    const domCompany  = scrapeCompanyFromDOM(domName || jsonLd.name)
    const domExp      = scrapeFromExperience()

    // 2. Meta tags (good fallback)
    const meta = scrapeFromMeta()

    // 3. Heuristic parse of headline
    const parsed = parseHeadlineForCompany(domHeadline || jsonLd.position || meta.position)

    // ── Merge: Prefer JSON-LD / DOM data, fallback to Meta ──
    const name = jsonLd.name || domName || meta.name || ''

    // Choose the most specific position
    let position = domExp.position
      || jsonLd.position
      || parsed.position 
      || domHeadline 
      || meta.position 
      || ''

    // If position looks like a full headline with company, take just the first part
    if (position.includes(' - ') && position.length > 60) {
      position = position.split(' - ')[0].trim()
    }

    // Choose the most specific company
    const company = domExp.company
      || jsonLd.company
      || domCompany
      || parsed.company
      || meta.company
      || ''

    const email = scrapeEmail()
    const url   = window.location.href.split('?')[0]

    const result = {
      name,
      position,
      company,
      companyType: detectType(company),
      linkedinUrl: url,
      email,
    }

    return result
  }

  // ── Message listener ───────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.type === 'GET_PROFILE') {
      const attempt = (tries) => {
        const data = scrapeProfile()
        if (data.name || tries <= 0) {
          sendResponse(data)
        } else {
          setTimeout(() => attempt(tries - 1), 600)
        }
      }
      attempt(5)
      return true
    }
    return true
  })

  // ── Proactive push on page load ────────────────────────────
  const push = () => {
    try {
      if (!chrome.runtime?.id) return
      const data = scrapeProfile()
      if (data.name) {
        chrome.runtime.sendMessage({ type: 'PROFILE_READY', payload: data }, () => {
          if (chrome.runtime.lastError) { /* ignore disconnect errors */ }
        })
      }
    } catch (_) {}
  }

  window.addEventListener('load', () => {
    setTimeout(push, 1500)
    setTimeout(push, 3500)
  })

  // ── Handle LinkedIn SPA navigation ────────────────────────
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl && location.href.includes('/in/')) {
      lastUrl = location.href
      setTimeout(push, 2000)
    }
  }).observe(document.body, { subtree: true, childList: true })

})()
