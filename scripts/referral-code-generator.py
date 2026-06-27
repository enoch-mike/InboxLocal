#!/usr/bin/env python3
"""InboxLocal — Referral Code Generator

Generates unique referral codes from business names.
Format: SHORTNAME-XXXX where SHORTNAME is an abbreviation of the business
and XXXX is a random 4-character alphanumeric string.

Usage:
    python3 referral-code-generator.py "Lucca's Italian Kitchen"
    # Output: LUCCH-A1B2
"""

import sys
import random
import string
import re


def generate_code(business_name: str, length: int = 4) -> str:
    """Generate a referral code from a business name.
    
    Takes the first 4-5 uppercase consonants/letters from the name,
    combines with a random alphanumeric suffix.
    
    Examples:
        "Joe's Pizza"       -> JOESP-A1B2
        "Iron Fit Gym"      -> IRONF-C3D4
        "Blush & Co. Salon" -> BLUSH-E5F6
        "Lucca's Kitchen"   -> LUCCH-G7H8
    """
    # Clean the name: uppercase, remove non-alpha chars
    clean = re.sub(r"[^A-Za-z]", "", business_name).upper()
    
    # Take the first 5 characters (or fewer if short name)
    prefix_len = min(5, len(clean))
    
    # Strategy: take first consonants/letters
    prefix = clean[:prefix_len]
    
    # Pad if name is very short
    if len(prefix) < 4:
        prefix = prefix.ljust(4, 'X')
    
    # Generate random suffix
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=length))
    
    return f"{prefix}-{suffix}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 referral-code-generator.py \"Business Name\"")
        print("       python3 referral-code-generator.py \"Name1\" \"Name2\" ...")
        sys.exit(1)
    
    for name in sys.argv[1:]:
        code = generate_code(name)
        print(code)


if __name__ == "__main__":
    main()