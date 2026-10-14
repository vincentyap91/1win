from shared_components import main
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Extract shared UI and prove exact markup restoration.')
    parser.add_argument('--date', help='Evidence date in YYYY-MM-DD; defaults to today.')
    main(parser.parse_args().date)
